'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/?category=UPSC', label: 'UPSC' },
  { href: '/?category=SSC', label: 'SSC' },
  { href: '/?category=Banking', label: 'Banking' },
  { href: '/?category=Railways', label: 'Railways' },
  { href: '/?category=Defence', label: 'Defence' },
  { href: '/?category=State PSC', label: 'State PSC' },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <>
      <div className="tricolor-bar" />
      <div className="ticker-wrap">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <span className="ticker-label">⚡ Live</span>
          <span className="ticker-content">
            Latest Sarkari Naukri Notifications – UPSC CSE 2024 | SSC CGL | RRB NTPC | IBPS PO | Indian Army Agniveer |
            OPSC OCS | State PSC Vacancies | Bank Recruitment | Defence Jobs | Teaching Jobs – Apply Now!
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="site-logo">
            <div className="logo-emblem">🏛️</div>
            <div className="logo-text">
              <h1>SarkariNaukriHubs</h1>
              <span>सरकारी नौकरी का अड्डा</span>
            </div>
          </Link>
          <nav className="header-nav">
            {NAV.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`nav-link ${pathname === href ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
