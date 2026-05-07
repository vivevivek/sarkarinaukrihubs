import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Privacy Policy – SarkariNaukriHubs',
  description: 'Privacy Policy for SarkariNaukriHubs.com',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: 'Noto Serif, serif', color: '#0d2137', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>Last updated: January 2024</p>

        <h2>1. Information We Collect</h2>
        <p>SarkariNaukriHubs.com ("we", "our", "site") is an informational website. We collect anonymous usage data via Google Analytics to understand site traffic and improve user experience. We do not collect personally identifiable information unless you voluntarily contact us.</p>

        <h2 style={{ marginTop: 24 }}>2. Google AdSense & Cookies</h2>
        <p>We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website and other sites. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</p>

        <h2 style={{ marginTop: 24 }}>3. Third-Party Links</h2>
        <p>Our website aggregates job notifications from official government portals and third-party aggregators. We are not responsible for the privacy practices of linked external sites. We recommend reviewing their privacy policies.</p>

        <h2 style={{ marginTop: 24 }}>4. Data Security</h2>
        <p>We take reasonable precautions to protect information. However, no method of internet transmission is 100% secure.</p>

        <h2 style={{ marginTop: 24 }}>5. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically. Continued use of the site after changes constitutes acceptance of the updated policy.</p>

        <h2 style={{ marginTop: 24 }}>6. Contact</h2>
        <p>For questions about this Privacy Policy, contact us at: <strong>contact@sarkarinaukrihubs.com</strong></p>
      </div>
      <Footer />
    </>
  );
}
