import { Router } from 'itty-router';
import { getSourceData } from './data';
import { injectDataToSchema } from './routes/schema-injector';

// Define types for Cloudflare Workers environment
type ResponseInit = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
};

interface ResponseOptions extends ResponseInit {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

// Define basic stream type
declare interface ReadableStream {}

type BodyInit = string | ArrayBuffer | ArrayBufferView | ReadableStream;

// We need to declare these as we're not importing the Cloudflare Workers types
declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseOptions);
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: string;
  readonly url: string;
  readonly body: ReadableStream | null;
  readonly bodyUsed: boolean;
}

declare class Request {
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
}

declare class Headers {
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
}

declare class URL {
  constructor(url: string, base?: string);
  readonly searchParams: URLSearchParams;
}

declare class URLSearchParams {
  get(name: string): string | null;
}

declare interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface Env {
  // Define your environment variables here if needed
  // MY_VAR: string;
}

// Create a new router
const router = Router();

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS requests (for CORS preflight)
router.options('*', () => {
  return new Response(null as any, {
    headers: corsHeaders,
  });
});

// Handle the sources endpoint
router.get('/api/v1/form-builder-mock/sources', async (request) => {
  const url = new URL(request.url);
  const source = url.searchParams.get('source');
  
  if (!source) {
    return new Response(JSON.stringify({
      status: 400,
      success: false,
      message: "Missing 'source' parameter"
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 400
    } as ResponseInit);
  }
  
  const data = getSourceData(source);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
    status: data.status || 200
  } as ResponseInit);
});

// Handle uploader endpoint (mock)
router.post('/api/v1/form-builder-mock/uploader', async () => {
  return new Response(JSON.stringify({
    status: 200,
    success: true,
    data: {
      url: 'https://cdn.salla.sa/form-builder/EMl1Ae8o35qzaG0HvVqz0IpeqcK9uyHliKksscja.jpg',
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  } as ResponseInit);
});

router.post('/api/v1/form-builder-mock', async (request) => {
    return new Response(await request.text(), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    } as ResponseInit);
  });

router.post('/api/v1/form-builder-mock/schema-injector', async (request) => {
    const data = await request.json();
    return new Response(JSON.stringify(injectDataToSchema(data.schema, data.data)), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    } as ResponseInit);
  });

// Handle 404 - Not Found
router.all('*', () => {
  return new Response(JSON.stringify({
    status: 404,
    success: false,
    message: 'Not Found'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    },
    status: 404
  } as ResponseInit);
});

// Export the worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
