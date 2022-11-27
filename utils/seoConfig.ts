import type { ManifestOptions } from 'vite-plugin-pwa';

/**
 * Defines the default SEO configuration for the website.
 */
export const seoConfig = {
  baseURL: 'https://tayles.co.uk',
  siteName: 'Tayles',
  description: 'This is the personal site of David Taylor',
  type: 'website',
  image: {
    url: '/img/opengraph.png', // Change this to your website's thumbnail.
    alt: 'Tayles', // Change this to your website's thumbnail description.
    width: 1200,
    height: 630,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

/**
 * Defines the configuration for PWA webmanifest.
 */
export const manifest: Partial<ManifestOptions> = {
  name: 'Tayles', // Change this to your website's name.
  short_name: 'Tayles', // Change this to your website's short name.
  description: 'Personal site of David Taylor', // Change this to your websites description.
  theme_color: '#00a35b', // Change this to your primary color.
  background_color: '#293344', // Change this to your background color.
  display: 'minimal-ui',
  icons: [
    {
      src: '/favicons/favicon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/favicons/favicon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: '/favicons/favicon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};
