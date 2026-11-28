import { resolve } from 'node:path';
import { assertNoProtectedMaterialAssets } from './scripts/protected-materials';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [{
    name: 'protected-materials',
    async configResolved(config) {
      if (config.publicDir) await assertNoProtectedMaterialAssets(resolve(config.root, config.publicDir));
      config.server.fs.deny.push('**/.material-check/**', '**/.material-source/**', '**/public/materials/**');
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        let path: string;
        try { path = new URL(decodeURIComponent(request.url?.split('?')[0] ?? '/'), 'http://localhost').pathname; }
        catch { response.statusCode = 400; response.end(); return; }
        if (path.startsWith('/materials/') || path.startsWith(server.config.base + 'materials/') ||
            /(?:^|\/)\.(?:material-check|material-source)(?:\/|$)/.test(path) || path.includes('/public/materials/')) {
          response.statusCode = 404;
          response.end();
          return;
        }
        next();
      });
    },
  }, react(), tailwindcss()],
  // GitHub Pages supplies base_path without a trailing slash. Normalize it
  // before Vite exposes BASE_URL to HTML icon and manifest links.
  base: `${(process.env.VITE_BASE_PATH || '.').replace(/\/+$/, '')}/`,
});
