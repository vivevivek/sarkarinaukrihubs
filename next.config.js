/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.employmentnews.gov.in', 'ssc.gov.in', 'www.upsc.gov.in'],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  env: {
    ADSENSE_PUBLISHER_ID: process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  },
};

module.exports = nextConfig;
