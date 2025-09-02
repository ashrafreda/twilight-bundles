import { Plugin } from 'vite';
import { resolve } from 'path';
import * as fs from 'fs';

interface BuildPluginOptions {
    componentsGlob?: string;
    outDir?: string;
}

export function findComponentFiles(): Record<string, string> {
    const baseDir = process.cwd();
    const componentDir = resolve(baseDir, 'src/components');

    if (!fs.existsSync(componentDir)) {
        return {};
    }

    const entries: Record<string, string> = {};
    fs.readdirSync(componentDir)
        .filter(file => fs.statSync(resolve(componentDir, file)).isDirectory())
        .forEach(dir => {
            const entryPath = resolve(componentDir, dir, 'index.ts');
            if (fs.existsSync(entryPath)) {
                entries[dir] = entryPath;
            }
        });

    return entries;
}

export function sallaBuildPlugin(): Plugin {
    return {
        name: 'salla-component-build',
        enforce: 'pre' as const,
        config(config) {
            const entries = findComponentFiles();
            
            if (Object.keys(entries).length === 0) {
                console.warn('No component entries found in src/components directory');
                return config;
            }
            
            console.log('Building components:', Object.keys(entries));
            
            return {
                ...config,
                build: {
                    ...config.build,
                    lib: {
                        entry: entries,
                        formats: ['es'],
                        fileName: (_format, entryName) => `${entryName}.js`
                    },
                    rollupOptions: {
                        external: [/^lit/],
                        output: {
                            globals: {
                                lit: 'lit',
                                'lit-element': 'litElement',
                                'lit-html': 'litHtml'
                            }
                        }
                    }
                }
            };
        }
    };
}
