import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];
        const endpoint = urlPath.replace('/api/', '');

        try {
          let body = {};
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            if (dataStr) {
              try {
                body = JSON.parse(dataStr);
              } catch {
                body = {};
              }
            }
          }

          const handlerModule = await server.ssrLoadModule(`./api/${endpoint}.ts`);
          const handler = handlerModule.default;

          if (typeof handler === 'function') {
            const expressReq = {
              ...req,
              body,
              query: {},
              method: req.method,
            };

            const expressRes = {
              setHeader(name: string, value: string) {
                res.setHeader(name, value);
                return expressRes;
              },
              status(code: number) {
                res.statusCode = code;
                return expressRes;
              },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return expressRes;
              },
              send(data: string | Buffer) {
                res.end(data);
                return expressRes;
              },
              end(data?: string | Buffer) {
                res.end(data);
                return expressRes;
              },
            };

            await handler(expressReq, expressRes);
          } else {
            next();
          }
        } catch (err) {
          console.error(`[API Dev Server Error] ${endpoint}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal API Server Error', details: String(err) }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), expressApiPlugin()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
