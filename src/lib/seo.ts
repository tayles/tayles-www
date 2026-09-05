/**
 * Site-wide SEO defaults, carried over from the previous tayles.co.uk build.
 *
 * The one thing deliberately absent is a default OpenGraph image: every page
 * uses the screenshot of the design it is showing instead, so a shared link
 * previews the design the visitor will actually land on. See
 * `getSocialImage` in `@/lib/designs`.
 */
export const seoConfig = {
  baseURL: 'https://tayles.co.uk',
  siteName: 'Tayles',
  description:
    'This is the home of David Taylor, a passionate and creative engineering leader from the UK, currently living in Toronto, Canada',
  type: 'website',
  themeColor: '#00a35b',
  backgroundColor: '#293344',
  image: {
    alt: 'Tayles',
    width: 1200,
    height: 630,
  },
  twitter: {
    card: 'summary_large_image',
  },
} as const;

/** PNG `rel="icon"` sizes present in `public/favicons/`. */
export const iconSizes = [16, 32, 96, 192] as const;
