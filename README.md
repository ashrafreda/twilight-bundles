# Salla Twilight Bundles

A monorepo for building and developing custom Twilight components for Salla's e-commerce platform.

## Packages

### 1. Core (`@salla.sa/twilight-bundles`)
The core package provides build tools and plugins for Twilight components:
- Vite plugins for building and development
- Build configuration and optimization
- Development server and demo environment

[Learn more about the core package](packages/core/README.md)

### 2. Starter Kit (`@salla.sa/twilight-bundles-starter-kit`)
A template for creating new Twilight component packages:
- Pre-configured build setup
- Development environment
- Example components
- Best practices and conventions

[Learn more about the starter kit](packages/starter-kit/README.md)

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/SallaApp/twilight-bundles.git
cd twilight-bundles
```

2. Install dependencies:
```bash
pnpm install
```

3. Choose your path:
   - To create new components: Use the starter kit
   - To contribute to build tools: Work with the core package

## Development Workflow

1. **Creating Components**
   - Start with the starter kit
   - Remove example components
   - Create your components in `packages/starter-kit/src/components/`
   - Follow the component requirements

2. **Development**
   - Run `pnpm run dev` for development
   - Use the demo environment
   - Hot module reloading enabled
   - Test your components in real-time
   - PS: You can serve the bundles dist `packages/core/dist/twilight-bundles.js` by your vs editor or any way then pass it via env something like `TWILIGHT_BUNDLES_URL=http://127.0.0.1:5500/packages/core/dist/twilight-bundles.js pnpm dev` if you are using go live feature on windsurf editor

3. **Building**
   - Run `pnpm run build` to create production bundles
   - Each component gets its own output file
   - Files are optimized for production

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License

MIT

## TODO

- Support building a light version without lit and common scripts dependencies to reduce bundle size
