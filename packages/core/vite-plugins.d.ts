export { sallaBuildPlugin } from './src/vite-plugins/build';
export { sallaDemoPlugin } from './src/vite-plugins/demo';
export { sallaTransformPlugin } from './src/vite-plugins/transform';
export interface SallaPluginOptions {
    pattern?: RegExp;
    componentsGlob?: string;
    outDir?: string;
    demo?: {
        port?: number;
        host?: string;
    };
}
//# sourceMappingURL=vite-plugins.d.ts.map