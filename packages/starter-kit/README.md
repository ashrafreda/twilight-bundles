# Salla Twilight Bundles Starter Kit

This starter kit provides a foundation for building custom Twilight components for Salla's e-commerce platform. It includes a pre-configured build setup and development environment to help you get started quickly.

## Getting Started

1. Clone this repository
2. Remove the example components in `src/components/`
3. Create your own components using the component generator:
   ```
   pnpm run create-component
   ```
4. Run `pnpm install` to install dependencies
5. Run `pnpm run dev` to start the development server
6. Run `pnpm run build` to build your components for production

## Project Structure

```
src/
  components/
    your-component-name/
      index.ts        # Main component file
      styles.ts       # Component styles (optional)
      types.ts        # Component types (optional)
```

## Built-in Plugins

This starter kit includes three Vite plugins that handle the build process:

### 1. Transform Plugin (`sallaTransformPlugin`)
- Transforms component files to ensure proper naming and registration
- Matches components in `src/components/*/index.ts`
- To disable: Remove from `vite.config.ts` plugins array

### 2. Build Plugin (`sallaBuildPlugin`)
- Handles component bundling and output
- Creates individual files for each component in `dist/`
- Configures external dependencies (lit libraries)
- To customize: Remove from plugins array and configure your own build settings:
  ```typescript
  {
    build: {
      lib: {
        entry: {/* your entries */},
        formats: ['es'],
        fileName: (format, entryName) => `${entryName}.js`
      },
      rollupOptions: {
        external: [/^lit/],
        output: {/* your output config */}
      }
    }
  }
  ```

### 3. Demo Plugin (`sallaDemoPlugin`)
- Provides a development environment for testing components
- Creates a demo page with your components
- Configures hot module reloading
- To disable: Remove from plugins array and set up your own dev server

### Demo Plugin Options

The `sallaDemoPlugin` accepts the following configuration options:

```typescript
{
  // Optional: Show only specific components
  components?: string[];

  // Optional: Customize the demo grid layout
  grid?: {
    // CSS grid-template-columns value
    columns?: string;     // default: 'repeat(auto-fill, minmax(300px, 1fr))'
    
    // Gap between components
    gap?: string;        // default: '1rem'
    
    // Responsive breakpoint
    minWidth?: string;   // default: '300px'
  };

  // Optional: Add custom CSS
  css?: string;

  // Optional: Add custom JavaScript
  js?: string;
}
```

#### Example Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    // ... other plugins
    sallaDemoPlugin({
      // Show only specific components
      components: ['product-card', 'scroll-top'],
      
      // Customize grid layout
      grid: {
        columns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        minWidth: '768px'
      },

      // Add custom styles
      css: `
        .component-card {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .component-card:hover {
          transform: translateY(-2px);
        }
      `,

      // Add custom JavaScript
      js: `
        console.log('Demo page loaded!');
        // Add your custom JavaScript here
      `
    })
  ]
});
```

## Creating New Components

This starter kit includes a component generator to help you create new components quickly. To use it, run:

```bash
pnpm create-component
```

The generator will:
1. Prompt you for a component name (in kebab-case format)
2. Validate that the name is in kebab-case and doesn't already exist
3. Create a new component folder with an `index.ts` file
4. Add the component definition to `twilight-bundle.json`

## Component Requirements

Each component should:
1. Be a class that extends `LitElement`
2. Export the class as default
3. Be placed in its own directory under `src/components/`
4. Have an `index.ts` as the entry point

Example:
```typescript
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export default class MyComponent extends LitElement {
  @property({ type: String })
  name = 'World';

  static styles = css`/* your styles */`;

  render() {
    return html`<div>Hello ${this.name}!</div>`;
  }
}
```

## Building for Production

Run `pnpm run build` to create production-ready bundles in the `dist/` directory. Each component will have its own file named after the component (e.g., `my-component.js`).

## Development

Run `pnpm run dev` to start the development server. This will:
1. Create a demo page with all your components
2. Enable hot module reloading
3. Provide a development environment for testing

## License

MIT
