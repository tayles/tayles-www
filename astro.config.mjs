// Helper imports
import { manifest, seoConfig } from './utils/seo-config';

import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'astro/config';
// Astro integration imports
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: seoConfig.baseURL,
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
        // path: './tailwind.config.cjs',
      },
    }),
  ],
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest,
        workbox: {
          globDirectory: 'dist',
          globPatterns: [
            '**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}',
          ],
          // Don't fallback on document based (e.g. `/some-page`) requests
          // This removes an errant console.log message from showing up.
          navigateFallback: null,
        },
      }),
    ],
  },
});
