import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Disclaimer – SarkariNaukriHubs',
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', lineHeight: 1.8 }}>
        <h1 style={{ fontFamily: 'Noto Serif, serif', color: '#0d2137', marginBottom: 8 }}>Disclaimer</h1>

        <p><strong>SarkariNaukriHubs.com</strong> is an independent job aggregator website and is <strong>not affiliated with, endorsed by, or associated with</strong> any government body, ministry, department, or official portal of India.</p>

        <h2 style={{ marginTop: 24 }}>Information Accuracy</h2>
        <p>We strive to provide accurate and up-to-date information by aggregating data from official government websites and trusted sources. However, we make no warranties about the completeness, accuracy, or reliability of this information. <strong>Always verify job notifications directly on the official government portal before applying.</strong></p>

        <h2 style={{ marginTop: 24 }}>No Application Processing</h2>
        <p>We do not process job applications. All application links redirect to official government portals. We do not charge any fees for job information.</p>

        <h2 style={{ marginTop: 24 }}>External Links</h2>
        <p>Our site contains links to external websites. We are not responsible for the content or accuracy of external sites.</p>

        <h2 style={{ marginTop: 24 }}>Advertising</h2>
        <p>This website displays Google AdSense advertisements to support its operation. These ads are served by Google and are subject to Google's advertising policies.</p>
      </div>
      <Footer />
    </>
  );
}
