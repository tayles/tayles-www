import { defineConfig } from 'astro/config';

// https://astro.build/config
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tayles.co.uk',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind(), sitemap()],
});
