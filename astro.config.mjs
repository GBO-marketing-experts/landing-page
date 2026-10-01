import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Org root site: serves at https://gbomkt.github.io/. When a custom domain
// arrives: change `site` to it and add a public/CNAME file; base stays '/'.
export default defineConfig({
  site: 'https://gbomkt.github.io',
  base: '/',
  vite: { plugins: [tailwindcss()] },
});
