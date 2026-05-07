export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ],
    sitemap: 'https://sarkarinaukrihubs.com/sitemap.xml',
  };
}
