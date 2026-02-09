//@ts-nocheck
declare global {
  const Salla: any;
}
import { defineConfig, Plugin } from 'vite';
import {
sallaBuildPlugin,
sallaDemoPlugin,
sallaTransformPlugin,
} from '@salla.sa/twilight-bundles/vite-plugins';

// Plugin to inject import map for lit module resolution
function litImportMapPlugin(): Plugin {
return {
  name: 'lit-import-map',
  transformIndexHtml(html) {
    const importMap = `
<script type="importmap">
{
"imports": {
  "lit": "https://cdn.jsdelivr.net/npm/lit@3/+esm",
  "lit/": "https://cdn.jsdelivr.net/npm/lit@3/",
  "lit/decorators.js": "https://cdn.jsdelivr.net/npm/lit@3/decorators.js/+esm",
  "@lit/reactive-element": "https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/+esm",
  "lit-html": "https://cdn.jsdelivr.net/npm/lit-html@3/+esm",
  "lit-element/lit-element.js": "https://cdn.jsdelivr.net/npm/lit-element@4/lit-element.js/+esm"
}
}
</script>`;
    return html.replace('<head>', `<head>${importMap}`);
  },
};
}

export default defineConfig({
plugins: [
  litImportMapPlugin(),
  sallaTransformPlugin(),
  sallaBuildPlugin(),
  sallaDemoPlugin({
    // Uncomment to preview only specific components
    // components: ['product-card', 'scroll-top', 'table-list']
  }),
],
optimizeDeps: {
  include: ['lit', 'lit/decorators.js'],
},
});