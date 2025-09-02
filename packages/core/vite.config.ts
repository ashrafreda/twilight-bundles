import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'twilight-bundles': resolve(__dirname, 'src/index.ts'),
        'vite-plugins/index': resolve(__dirname, 'vite-plugins.ts'),
        'vite-plugins/build': resolve(__dirname, 'src/vite-plugins/build.ts'),
        'vite-plugins/demo': resolve(__dirname, 'src/vite-plugins/demo/index.ts'),
        'vite-plugins/transform': resolve(__dirname, 'src/vite-plugins/transform.ts')
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
        external: [
        //    /^lit/,
            'fs',
            'path',
            'glob',
            'url',
            'readline',
            'uuid'
        ],
        output: {
            globals: {
                lit: 'lit',
                'lit-element': 'litElement',
                'lit-html': 'litHtml',
            },
            // sourcemap: true,
            dir: 'dist',    
        },
    }
  },
  server: {
    port: 3000,
    open: '/dist/twilight-bundles.js',
    // watch: {
    //   // Watch for changes in the dist directory
    // //   ignored: ['!**/dist/**']
    // },
    // // Serve the dist directory for the library
    // fs: {
    //   allow: ['dist']
    // }
  }
});
