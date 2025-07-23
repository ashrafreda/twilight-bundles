import { Plugin } from 'vite';
import { createDemoHTML } from './template';
import { findComponentFiles } from '../build';
import * as fs from 'fs';
import * as path from 'path';

interface DemoPluginOptions {
    components?: string[];  // Optional list of component names to include
    grid?: {
        columns?: string;   // CSS grid-template-columns value (e.g., 'repeat(3, 1fr)')
        gap?: string;       // CSS gap value (e.g., '1.5rem')
        minWidth?: string;  // Min width for auto-fill/auto-fit columns
    };
    css?: string;          // Custom CSS to inject
    js?: string;           // Custom JS to inject
    formbuilder?: {
        languages?: string[];   // List of languages for form builder
        defaultLanguage?: 'ar' | 'en' | string; // Default language for form builder
    };
}

function cleanupDemoFile(filePath: string) {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        // console.log('Removed auto-generated demo file:', filePath);
    }
}

function  getSchemaForComponent(componentName: string):string {
    try {
        //get schema from twilight-bundles.json file, on process.cwd(), on the path components[*].fields when components[*].name === componentName
        const twilightBundlesPath = path.join(process.cwd(), 'twilight-bundle.json');
        const twilightBundles = JSON.parse(fs.readFileSync(twilightBundlesPath, 'utf-8'));
        const component = twilightBundles.components.find((component: any) => component.name === componentName);
        if(!component?.fields){
            return '';
        }
        component.fields.push({
            type: "string",
            format: "hidden",
            id: "twilight-bundles-component-name",
            value: componentName
        });
        
        return JSON.stringify(component?.fields);
    } catch (error) {
        console.error('Error getting schema for component:', error);
        return '';
    }
}

export function sallaDemoPlugin(options: DemoPluginOptions = {}): Plugin {
    let demoPath: string | undefined;

    return {
        name: 'salla-component-demo',
        enforce: 'pre' as const,

        configResolved(config) {
            // If open option is provided, ignore creating a demo page
            if (config.server?.open) {
                return;
            }

            const componentFiles = findComponentFiles();
            
            // Filter components if options.components is provided
            let filteredComponents:Record<string,{path:string,url:string,schema:string}> | Record<string,string> = options.components 
                ? Object.fromEntries(
                    Object.entries(componentFiles)
                        .filter(([name]) => options.components!.includes(name))
                  )
                : componentFiles;
                

            const demoBasePath = '.salla-temp'
            const tempDir = path.resolve(process.cwd(), 'node_modules', demoBasePath);
            const formattedComponents = Object.entries(filteredComponents)
                    .map(function([name, path]):  {name:string, path:string, url:string, schema:string} {
                        const url = config.server?.port
                        ? path.replace(process.cwd(), `http://localhost:${config.server?.port}`)
                        : path;
                        const schema = getSchemaForComponent(name);
                        return { name, path, url, schema };
                    });

            // Create temp directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            demoPath = path.resolve(tempDir, 'index.html');

            // Create demo.html in temp directory
            fs.writeFileSync(demoPath, createDemoHTML(formattedComponents, {
                grid: {
                    columns: options.grid?.columns || 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: options.grid?.gap || '1rem',
                    minWidth: options.grid?.minWidth || '300px'
                },
                css: options.css || '',
                js: options.js || '',
                formbuilder: {
                    languages: options.formbuilder?.languages || ['ar', 'en'],
                    defaultLanguage: options.formbuilder?.defaultLanguage || 'ar'
                }
            }));

            // Setup cleanup handlers
            const cleanup = () => {
                cleanupDemoFile(demoPath!);
                // Try to remove the temp directory
                try {
                    fs.rmdirSync(tempDir);
                } catch (e) {
                    // Ignore errors if directory is not empty
                }
            };

            process.on('SIGINT', cleanup);  // Ctrl+C
            process.on('SIGTERM', cleanup); // Kill
            process.on('exit', cleanup);    // Normal exit

            // Update server config to open our demo page
            config.server.open = `/node_modules/${demoBasePath}/index.html`;
        },

        configureServer(server) {
            // Only use demo server middleware if we created the demo page
            // if (demoPath) {
            //     server.middlewares.use(configureDemoServer({ componentsGlob }));
            // }
        },

        config(config) {
            return {
                ...config,
                server: {
                    ...config.server,
                    watch: {
                      usePolling: true,
                      interval: 100
                    }
                }
            };
        },

        closeBundle() {
            // Clean up the auto-generated demo file after build
            cleanupDemoFile(demoPath!);

            // Try to remove the temp directory
            const tempDir = path.resolve(process.cwd(), 'node_modules/.salla-temp');
            try {
                fs.rmdirSync(tempDir);
            } catch (e) {
                // Ignore errors if directory is not empty
            }
        }
    };
}
