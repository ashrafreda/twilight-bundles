import type { Plugin, UserConfig, LibraryOptions } from 'vite';

export interface SallaComponentPluginOptions {
    pattern?: RegExp;
    componentsGlob?: string;
    outDir?: string;
    demo?: {
        port?: number;
        host?: string;
    };
}

export interface BuildConfig extends UserConfig {
    build: {
        lib: LibraryOptions & {
            entry: Record<string, string>;
        };
        outDir: string;
        emptyOutDir: boolean;
        rollupOptions: {
            external: (RegExp | string)[];
            output: {
                globals: Record<string, string>;
            };
        };
    };
    server?: {
        port: number;
        host: string;
        open: boolean;
    };
}

export type { Plugin };
