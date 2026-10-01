import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project site. When a custom domain arrives: set `site` to it,
// change `base` to '/', and add a public/CNAME file.
export default defineConfig({
  site: 'https://gbo-marketing-experts.github.io',
  base: '/landing-page/',
  vite: { plugins: [tailwindcss()] },
});
