import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages supplies base_path without a trailing slash. Normalize it
  // before Vite exposes BASE_URL to HTML icon and manifest links.
  base: `${(process.env.VITE_BASE_PATH || '.').replace(/\/+$/, '')}/`,
});
