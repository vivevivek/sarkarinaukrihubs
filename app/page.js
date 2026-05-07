'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { AdBanner } from './components/AdBanner';

const CATEGORIES = ['All','UPSC','SSC','Banking','Railways','Defence','State PSC','Teaching','PSU','Central Government'];

const SECTION_TABS = [
  { id: 'jobs',       label: '📋 Latest Jobs',   color: '#0d2137' },
  { id: 'admitcards', label: '🎫 Admit Cards',   color: '#1565c0' },
  { id: 'results',    label: '📊 Results',       color: '#2e7d32' },
  { id: 'answerkeys', label: '🔑 Answer Keys',   color: '#6a1b9a' },
];

const PORTALS_SIDEBAR = [
  { name:'UPSC',          url:'https://www.upsc.gov.in',              logo:'🏛️' },
  { name:'SSC',           url:'https://ssc.gov.in',                   logo:'📋' },
  { name:'IBPS',          url:'https://www.ibps.in',                  logo:'🏦' },
  { name:'SBI Careers',   url:'https://sbi.co.in/web/careers',        logo:'💰' },
  { name:'RRB Railways',  url:'https://www.rrbcdg.gov.in',            logo:'🚂' },
  { name:'Indian Army',   url:'https://joinindianarmy.nic.in',        logo:'⭐' },
  { name:'Indian Navy',   url:'https://www.joinindiannavy.gov.in',    logo:'⚓' },
  { name:'DRDO',          url:'https://www.drdo.gov.in/careers',      logo:'🔬' },
  { name:'ISRO',          url:'https://www.isro.gov.in/Careers.html', logo:'🚀' },
  { name:'Employment News',url:'https://www.employmentnews.gov.in',   logo:'📰' },
  { name:'NCS Portal',    url:'https://www.ncs.gov.in',               logo:'🌐' },
  { name:'RBI Careers',   url:'https://opportunities.rbi.org.in',     logo:'🏦' },
];

const STATE_PSC_SIDEBAR = [
  ['OPSC (Odisha)', 'https://www.opsc.gov.in'],
  ['OSSSC Odisha', 'https://www.osssc.gov.in'],
  ['UPPSC', 'https://uppsc.up.nic.in'],
  ['BPSC Bihar', 'https://www.bpsc.bih.nic.in'],
  ['MPPSC', 'https://mppsc.mp.gov.in'],
  ['RPSC Rajasthan', 'https://rpsc.rajasthan.gov.in'],
  ['MPSC Maharashtra', 'https://mpsc.gov.in'],
  ['TNPSC Tamil Nadu', 'https://www.tnpsc.gov.in'],
  ['KPSC Karnataka', 'https://www.kpsc.kar.nic.in'],
  ['WBPSC', 'https://psc.wb.gov.in'],
  ['HPSC Haryana', 'https://hpsc.gov.in'],
  ['JPSC Jharkhand', 'https://www.jpsc.gov.in'],
];

// ── Badge ────────────────────────────────────────────────────────────────────
function JobBadge({ badge }) {
  if (!badge) return null;
  const cls = {
    'Official': 'badge-official',
    'New': 'badge-new',
    'Hot': 'badge-hot',
    'NCS': 'badge-ncs',
    'Admit Card': 'badge-admitcard',
    'Result': 'badge-result',
    'Answer Key': 'badge-answerkey',
    'Jagran': 'badge-jagran',
  }[badge] || 'badge-new';
  return <span className={`job-badge ${cls}`}>{badge}</span>;
}

// ── Rich Job Card ─────────────────────────────────────────────────────────────
function JobCard({ job }) {
  const detailUrl = `/job/${encodeURIComponent(job.id)}?src=${encodeURIComponent(job.detailSourceUrl || job.link)}&title=${encodeURIComponent(job.title)}&cat=${encodeURIComponent(job.category)}&badge=${encodeURIComponent(job.badge || '')}&link=${encodeURIComponent(job.link)}&org=${encodeURIComponent(job.organization || '')}&lastDate=${encodeURIComponent(job.lastDate || '')}&vacancies=${encodeURIComponent(job.vacancies || '')}&salary=${encodeURIComponent(job.salary || '')}`;

  return (
    <div className="job-card">
      {/* Top row */}
      <div className="job-card-top">
        <div>
          {job.organization && <div className="job-org">🏛️ {job.organization}</div>}
          <a href={detailUrl} className="job-title-link">
            <h3 className="job-title">{job.title}</h3>
          </a>
        </div>
        <JobBadge badge={job.badge} />
      </div>

      {/* Key stats row */}
      <div className="job-stats-row">
        {job.vacancies && (
          <div className="job-stat">
            <span className="stat-icon">👥</span>
            <span className="stat-label">Vacancies</span>
            <span className="stat-val">{job.vacancies}</span>
          </div>
        )}
        {job.salary && (
          <div className="job-stat">
            <span className="stat-icon">💰</span>
            <span className="stat-label">Salary</span>
            <span className="stat-val">{job.salary.slice(0, 40)}</span>
          </div>
        )}
        {job.ageLimit && (
          <div className="job-stat">
            <span className="stat-icon">🎂</span>
            <span className="stat-label">Age Limit</span>
            <span className="stat-val">{job.ageLimit}</span>
          </div>
        )}
        {job.qualification && (
          <div className="job-stat">
            <span className="stat-icon">🎓</span>
            <span className="stat-label">Qualification</span>
            <span className="stat-val">{job.qualification.slice(0, 50)}</span>
          </div>
        )}
        {job.applyMode && (
          <div className="job-stat">
            <span className="stat-icon">🖥️</span>
            <span className="stat-label">Apply Mode</span>
            <span className="stat-val">{job.applyMode}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <p className="job-desc">{job.description}</p>
      )}

      {/* Bottom row */}
      <div className="job-card-footer">
        <div className="job-meta">
          <span>📁 {job.category}</span>
          <span>🌐 {job.source}</span>
          {job.pubDate && <span>🕐 {formatDate(job.pubDate)}</span>}
        </div>
        <div className="job-actions">
          {job.lastDate && (
            <span className="last-date-badge">⏰ Last Date: {job.lastDate}</span>
          )}
          <a href={detailUrl} className="view-detail-btn">View Details →</a>
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="apply-now-btn">Apply Now ↗</a>
        </div>
      </div>
    </div>
  );
}

function formatDate(str) {
  if (!str) return '';
  try { return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return str.slice(0, 20); }
}

function SkeletonCard() {
  return (
    <div className="job-card" style={{ opacity: 0.6 }}>
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '60%' }} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [section, setSection]   = useState('jobs');
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [counts, setCounts]     = useState({});
  const [refreshedAt, setRefreshedAt] = useState('');
  const searchRef               = useRef(null);

  const fetchJobs = useCallback(async (sec, cat, q, pg) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ section: sec, category: cat, search: q, page: pg });
      const res = await fetch(`/api/jobs?${p}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setCounts(data.counts || {});
      if (data.refreshedAt) setRefreshedAt(new Date(data.refreshedAt).toLocaleTimeString('en-IN'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(section, category, search, page); }, [section, category, search, page, fetchJobs]);

  const handleSection = (s) => { setSection(s); setCategory('All'); setSearch(''); setSearchInput(''); setPage(1); };
  const handleCategory = (c) => { setCategory(c); setPage(1); };
  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const currentTab = SECTION_TABS.find(t => t.id === section);
  const sectionLabel = { jobs: 'Job Notifications', admitcards: 'Admit Cards / Hall Tickets', results: 'Results & Merit Lists', answerkeys: 'Answer Keys' }[section];

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="hero-tag">🇮🇳 India's #1 Sarkari Job Alert Platform</span>
          <h2>Latest Sarkari Naukri Notifications</h2>
          <p className="hero-hindi">सभी सरकारी नौकरियाँ – एक जगह पर, हर 4 घंटे में अपडेट</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search UPSC, SSC, Bank PO, Railway, Army..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit">🔍 Search</button>
          </form>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {['UPSC 2024', 'SSC CGL', 'Bank PO', 'RRB NTPC', 'Army Agniveer'].map(q => (
              <button key={q} className="quick-search-btn"
                onClick={() => { setSearchInput(q); setSearch(q); setPage(1); }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-dot" /><span>Live Feed</span></div>
          <div className="stat-item"><span className="stat-num">{total}</span><span>Active {sectionLabel}</span></div>
          <div className="stat-item"><span className="stat-num">38</span><span>Portals Monitored</span></div>
          <div className="stat-item"><span className="stat-num">5</span><span>Data Sources</span></div>
          <div className="stat-item"><span className="stat-num">4h</span><span>Refresh Interval</span></div>
          {refreshedAt && <div className="stat-item" style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>Updated: {refreshedAt}</div>}
        </div>
      </div>

      {/* Top Banner Ad */}
      <div style={{ maxWidth: 1200, margin: '16px auto', padding: '0 20px' }}>
        <AdBanner type="banner" />
      </div>

      {/* Section Tabs */}
      <div style={{ background: '#fff', borderBottom: '2px solid #e5e0d8', position: 'sticky', top: 64, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0 }}>
          {SECTION_TABS.map(tab => (
            <button
              key={tab.id}
              className={`section-tab ${section === tab.id ? 'active' : ''}`}
              style={section === tab.id ? { borderBottomColor: tab.color, color: tab.color } : {}}
              onClick={() => handleSection(tab.id)}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className="tab-count">{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        <main>
          {/* Category Filter */}
          {section === 'jobs' && (
            <div className="category-tabs">
              {CATEGORIES.map(cat => (
                <button key={cat} className={`cat-tab ${category === cat ? 'active' : ''}`} onClick={() => handleCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            ℹ️ <strong>Disclaimer:</strong> SarkariNaukriHubs.com aggregates notifications from official portals.
            Always verify on the official website before applying. Not affiliated with any government body.
          </div>

          {/* Section Header */}
          <div className="section-header">
            <div>
              <div className="section-title">{sectionLabel}</div>
              {category !== 'All' && <div style={{ fontSize: 13, color: '#FF9933', marginTop: 2 }}>Filtered: {category}</div>}
            </div>
            <span className="results-count">{total} found</span>
          </div>

          {/* Job List */}
          <div className="jobs-grid">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
              : jobs.length === 0
              ? <div className="empty-state">
                  <div style={{ fontSize: 48 }}>🔍</div>
                  <p>No {sectionLabel.toLowerCase()} found. Try a different filter.</p>
                  <button className="cat-tab active" style={{ marginTop: 12 }} onClick={() => { setSearch(''); setCategory('All'); setPage(1); }}>
                    Clear Filters
                  </button>
                </div>
              : jobs.map(job => <JobCard key={job.id} job={job} />)
            }
          </div>

          {/* Mid Ad */}
          {!loading && jobs.length > 8 && (
            <div style={{ margin: '20px 0' }}><AdBanner type="banner" /></div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {[...Array(Math.min(pages, 7))].map((_, i) => {
                const p = i + 1;
                return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => { setPage(p); window.scrollTo(0, 0); }}>{p}</button>;
              })}
              {pages > 7 && <span style={{ padding: '8px 4px' }}>...</span>}
              <button className="page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}

          {/* Bottom Ad */}
          {!loading && <div style={{ marginTop: 24 }}><AdBanner type="banner" /></div>}
        </main>

        {/* Sidebar */}
        <aside className="sidebar">
          <AdBanner type="rectangle" />

          {/* Quick Links */}
          <div className="sidebar-card">
            <div className="sidebar-title">⚡ Quick Sections</div>
            <div className="portal-list">
              {SECTION_TABS.map(tab => (
                <button key={tab.id} className="portal-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => handleSection(tab.id)}>
                  {tab.label} {counts[tab.id] > 0 && <span className="tab-count" style={{ marginLeft: 'auto' }}>{counts[tab.id]}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Official Portals */}
          <div className="sidebar-card">
            <div className="sidebar-title">🔗 Official Portals</div>
            <div className="portal-list">
              {PORTALS_SIDEBAR.map(({ name, url, logo }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="portal-item">
                  <span>{logo}</span><span>{name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          <AdBanner type="rectangle" />

          {/* State PSC */}
          <div className="sidebar-card">
            <div className="sidebar-title">🏛️ State PSC Portals</div>
            <div className="portal-list">
              {STATE_PSC_SIDEBAR.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="portal-item">
                  📄 {name}<span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          <AdBanner type="rectangle" />
        </aside>
      </div>

      <Footer />
    </>
  );
}
