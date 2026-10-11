import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';

/**
 * Runs netlify/functions/<name>.ts for requests to /api/<name> during `vite dev`, so the
 * contact form and GitHub stats work locally without the Netlify CLI. The functions are
 * standard (Request) => Response handlers, so this only adapts Node's req/res.
 */
function netlifyFunctionsDevPlugin(): Plugin {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // The site used to be served under /portfolio/; send old tabs/bookmarks to the root.
        if (req.url === '/portfolio' || req.url?.startsWith('/portfolio/')) {
          res.statusCode = 301;
          res.setHeader('Location', req.url.replace(/^\/portfolio\/?/, '/'));
          return res.end();
        }
        const match = req.url?.match(/^\/api\/([a-z0-9-]+)/i);
        if (!match) return next();

        try {
          const mod = await server.ssrLoadModule(`/netlify/functions/${match[1]}.ts`);
          const request = await toWebRequest(req);
          const response: Response = await mod.default(request, { ip: req.socket.remoteAddress ?? '127.0.0.1' });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          // Unknown function name or a crash: report it instead of falling back to index.html.
          console.error(`[dev functions] /api/${match[1]}:`, err);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `No dev handler for /api/${match[1]}` }));
        }
      });
    },
  };
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && chunks.length > 0;
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Expose server-only secrets (RESEND_API_KEY, GITHUB_TOKEN) to the dev function runner.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), netlifyFunctionsDevPlugin()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
