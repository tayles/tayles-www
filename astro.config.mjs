import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tayles.co.uk',
  integrations: [react(), sitemap()],
  // The toolbar sits bottom-centre, exactly where the design nav chrome does,
  // and swallows its clicks.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
