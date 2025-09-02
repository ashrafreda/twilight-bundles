# @salla.sa/twilight-bundles

Core build tools and plugins for Salla Twilight components. This package provides the build infrastructure used by the starter kit and other Twilight component packages.

## Features

- **Vite Plugins**: A set of plugins for building and developing Twilight components
- **Build Configuration**: Optimized build settings for component bundling
- **Development Tools**: Development server and demo environment

## Plugins

### 1. Transform Plugin (`sallaTransformPlugin`)

Transforms component files to ensure proper naming and registration in the Twilight system.

```typescript
import { sallaTransformPlugin } from '@salla.sa/twilight-bundles/vite-plugins';

export default defineConfig({
  plugins: [
    sallaTransformPlugin()
  ]
});
```

The transform plugin:
- Matches components in `src/components/*/index.ts`
- Ensures proper component registration
- Handles component naming based on directory structure

### 2. Build Plugin (`sallaBuildPlugin`)

Handles component bundling and output configuration.

```typescript
import { sallaBuildPlugin } from '@salla.sa/twilight-bundles/vite-plugins';

export default defineConfig({
  plugins: [
    sallaBuildPlugin()
  ]
});
```

The build plugin:
- Automatically discovers components in `src/components/`
- Creates individual files for each component
- Configures external dependencies (lit libraries)
- Optimizes build output

### 3. Demo Plugin (`sallaDemoPlugin`)

Provides a development environment for testing components.

```typescript
import { sallaDemoPlugin } from '@salla.sa/twilight-bundles/vite-plugins';

export default defineConfig({
  plugins: [
    sallaDemoPlugin()
  ]
});
```

The demo plugin:
- Creates a demo page with all components
- Configures hot module reloading
- Sets up the development server
- Provides a testing environment

## Usage

This package is typically used as a dependency in Twilight component packages. See the starter kit for a complete example of how to use these plugins.

## Development

1. Install dependencies:
```bash
pnpm install
```

2. Build the package:
```bash
pnpm run build
```

## License

MIT
