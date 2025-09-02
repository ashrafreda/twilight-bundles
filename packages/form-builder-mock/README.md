# Form Builder Mock API

This package provides a mock API for form builder resources using Cloudflare Workers. It simulates the API responses for the form builder without needing to call the actual API.

## Features

- Mock API endpoints for form builder resources
- Configurable data sources
- CORS support
- Easy to extend with new data sources

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run locally:

```bash
pnpm run dev
```

This will start a local development server, typically at http://localhost:8787.

## Endpoints

### Sources

```
GET /store/v1/form-builder-mock/sources?source=<source_name>
```

Available sources:
- `products`
- `categories`

Example:
```
GET /store/v1/form-builder-mock/sources?source=products
```

### Uploader (Mock)

```
POST /store/v1/form-builder-mock/uploader
```

Returns a mock response with a random image URL and ID.

## Adding New Data Sources

1. Create a new file in `src/data/` (e.g., `brands.ts`)
2. Export your data with the appropriate format
3. Import and add your data to the `dataSources` object in `src/data/index.ts`

## Deployment

To deploy to Cloudflare Workers:

1. Configure your Cloudflare account in `wrangler.toml`
2. Run:

```bash
pnpm run deploy
```

## Integration with Form Builder

Update the form builder configuration to use this mock API:

```html
<form-builder-3
  ...
  sources-url="https://api.salla.dev/store/v1/form-builder-mock/sources"
  upload-url="https://api.salla.dev/store/v1/form-builder-mock/uploader"
  ...
></form-builder-3>
```

## Local Development

For local development with the form builder, you can use:

```html
<form-builder-3
  ...
  sources-url="http://localhost:8787/store/v1/form-builder-mock/sources"
  upload-url="http://localhost:8787/store/v1/form-builder-mock/uploader"
  ...
></form-builder-3>
```
