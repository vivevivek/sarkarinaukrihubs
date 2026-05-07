import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">🏛️ SarkariNaukriHubs</div>
            <p className="footer-desc">
              India's trusted platform for government job notifications. We aggregate
              latest Sarkari Naukri alerts from UPSC, SSC, RRB, Banking, Defence,
              State PSC, and all major government portals – updated every hour.
            </p>
            <p style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
              सरकारी नौकरी की हर जानकारी, एक जगह पर।
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link href="/?category=UPSC">UPSC Jobs</Link>
            <Link href="/?category=SSC">SSC Jobs</Link>
            <Link href="/?category=Banking">Bank Jobs</Link>
            <Link href="/?category=Railways">Railway Jobs</Link>
            <Link href="/?category=Defence">Defence Jobs</Link>
            <Link href="/?category=Teaching">Teaching Jobs</Link>
          </div>
          <div className="footer-col">
            <h4>Official Portals</h4>
            <a href="https://www.upsc.gov.in" target="_blank" rel="noopener">UPSC</a>
            <a href="https://ssc.gov.in" target="_blank" rel="noopener">SSC</a>
            <a href="https://www.ibps.in" target="_blank" rel="noopener">IBPS</a>
            <a href="https://www.rrbcdg.gov.in" target="_blank" rel="noopener">RRB</a>
            <a href="https://www.employmentnews.gov.in" target="_blank" rel="noopener">Employment News</a>
            <a href="https://www.ncs.gov.in" target="_blank" rel="noopener">NCS Portal</a>
          </div>
          <div className="footer-col">
            <h4>State PSC</h4>
            <a href="https://www.opsc.gov.in" target="_blank" rel="noopener">OPSC (Odisha)</a>
            <a href="https://uppsc.up.nic.in" target="_blank" rel="noopener">UPPSC</a>
            <a href="https://www.bpsc.bih.nic.in" target="_blank" rel="noopener">BPSC</a>
            <a href="https://mppsc.mp.gov.in" target="_blank" rel="noopener">MPPSC</a>
            <a href="https://rpsc.rajasthan.gov.in" target="_blank" rel="noopener">RPSC</a>
            <a href="https://mpsc.gov.in" target="_blank" rel="noopener">MPSC</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} SarkariNaukriHubs.com · All Rights Reserved</span>
          <span>
            <span style={{ marginRight: 16 }}>
              <Link href="/disclaimer" style={{ color: 'inherit' }}>Disclaimer</Link>
            </span>
            <span style={{ marginRight: 16 }}>
              <Link href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
            </span>
            <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
          </span>
          <div className="footer-flag" title="Made in India 🇮🇳">
            <div className="flag-stripe" style={{ background: '#FF9933' }} />
            <div className="flag-stripe" style={{ background: '#ffffff' }} />
            <div className="flag-stripe" style={{ background: '#138808' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
