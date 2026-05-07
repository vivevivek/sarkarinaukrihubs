import './globals.css';
import Script from 'next/script';

const PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const metadata = {
  metadataBase: new URL('https://sarkarinaukrihubs.com'),
  title: {
    default: 'Sarkari Naukri Hubs – Latest Government Jobs 2026 | Sarkari Result',
    template: '%s | Sarkari Naukri Hubs',
  },
  description:
    'Get latest Sarkari Naukri notifications from UPSC, SSC, RRB, IBPS, Banking, Defence, State PSC and more. Free Job Alert, Admit Card, Result – all in one place.',
  keywords: [
    'sarkari naukri', 'government jobs', 'sarkari result', 'free job alert',
    'UPSC jobs', 'SSC jobs', 'RRB NTPC', 'IBPS PO', 'bank jobs', 'police jobs',
    'latest government jobs 2026', 'sarkari job', 'govt job alert',
  ],
  alternates: { canonical: 'https://sarkarinaukrihubs.com' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://sarkarinaukrihubs.com',
    siteName: 'Sarkari Naukri Hubs',
    title: 'Sarkari Naukri Hubs – Latest Government Jobs India',
    description: 'Latest Sarkari Naukri alerts from all major government portals.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarkari Naukri Hubs',
    description: 'Latest Government Job Notifications – UPSC, SSC, Banking, Railways & More',
  },
  robots: { index: true, follow: true },
};

const schemaData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sarkari Naukri Hubs',
  url: 'https://sarkarinaukrihubs.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://sarkarinaukrihubs.com/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaData }}
        />
      </head>
      <body>
        {children}

        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
