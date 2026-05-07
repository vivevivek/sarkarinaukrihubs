import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { AdBanner } from '../../components/AdBanner';


export const revalidate = 14400; // 4 hours

export async function generateMetadata({ searchParams }) {
  const title = searchParams?.title || 'Job Details';
  return {
    title: `${title} – SarkariNaukriHubs`,
    description: `Full details for ${title}: eligibility, vacancies, salary, important dates, and how to apply.`,
  };
}

export default async function JobDetailPage({ searchParams }) {
  const sourceUrl  = searchParams?.src  || '';
  const title      = searchParams?.title || 'Sarkari Job Notification';
  const category   = searchParams?.cat  || '';
  const badge      = searchParams?.badge || '';
  const applyLink  = searchParams?.link || sourceUrl;
  const org        = searchParams?.org  || '';
  const lastDate   = searchParams?.lastDate || '';
  const vacancies  = searchParams?.vacancies || '';
  const salary     = searchParams?.salary || '';

  // Scrape full detail from source page
  const detail = sourceUrl ? await scrapeJobDetail(sourceUrl) : null;

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div style={{ background: '#f8f6f2', borderBottom: '1px solid #e5e0d8', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: 13, color: '#6b7280' }}>
          <a href="/" style={{ color: '#0d2137', textDecoration: 'none' }}>Home</a>
          {category && <> › <a href={`/?category=${category}`} style={{ color: '#0d2137', textDecoration: 'none' }}>{category}</a></>}
          › <span style={{ color: '#6b7280' }}>Job Detail</span>
        </div>
      </div>

      <div className="detail-page">
        <div className="detail-inner">

          {/* ── LEFT: Job Details ── */}
          <main className="detail-main">

            {/* Header Card */}
            <div className="detail-header-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  {badge && <span className={`job-badge badge-${badge.toLowerCase().replace(/\s/g, '-')}`} style={{ display: 'inline-block', marginBottom: 10 }}>{badge}</span>}
                  <h1 className="detail-title">{detail?.title || title}</h1>
                  {org && <div className="detail-org">🏛️ {org}</div>}
                  <div className="detail-meta-row">
                    {(vacancies || detail?.vacancies) && <span>👥 <strong>{detail?.vacancies || vacancies}</strong> Vacancies</span>}
                    {(salary || detail?.salary) && <span>💰 {detail?.salary || salary}</span>}
                    {(lastDate || detail?.lastDate) && <span>📅 Last Date: <strong style={{ color: '#e65100' }}>{detail?.lastDate || lastDate}</strong></span>}
                    {detail?.ageLimit && <span>🎂 Age: {detail.ageLimit}</span>}
                    {detail?.applicationFee && <span>💳 Fee: {detail.applicationFee}</span>}
                    {detail?.applyMode && <span>🖥️ Apply: {detail.applyMode}</span>}
                  </div>
                </div>
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn">
                  Apply Now →
                </a>
              </div>
            </div>

            {/* Top Ad */}
            <AdBanner type="banner" />

            {/* Important Dates */}
            {detail?.importantDates?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">📅 Important Dates</h2>
                <TableDisplay rows={detail.importantDates} highlight="last date" />
              </div>
            )}

            {/* Vacancy Details */}
            {detail?.vacancyDetails?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">👥 Vacancy Details</h2>
                <TableDisplay rows={detail.vacancyDetails} />
              </div>
            )}

            {/* Salary Details */}
            {detail?.salaryDetails?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">💰 Salary / Pay Scale</h2>
                <TableDisplay rows={detail.salaryDetails} />
              </div>
            )}

            {/* All other tables */}
            {detail?.allTables?.filter(t => t !== detail.importantDates && t !== detail.vacancyDetails && t !== detail.salaryDetails)
              .slice(0, 3).map((table, i) => (
              <div key={i} className="detail-section">
                <TableDisplay rows={table} />
              </div>
            ))}

            {/* Eligibility */}
            {detail?.eligibilityCriteria?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">📋 Eligibility Criteria</h2>
                <ul className="detail-list">
                  {detail.eligibilityCriteria.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* Selection Process */}
            {detail?.selectionProcess?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">📊 Selection Process</h2>
                <ul className="detail-list">
                  {detail.selectionProcess.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* How to Apply */}
            {detail?.howToApply?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">✅ How to Apply</h2>
                <ol className="detail-list">
                  {detail.howToApply.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            {/* Full text fallback */}
            {!detail?.importantDates?.length && detail?.fullText && (
              <div className="detail-section">
                <h2 className="detail-section-title">📄 Notification Details</h2>
                <div className="detail-text">{detail.fullText}</div>
              </div>
            )}

            {/* Mid-content Ad */}
            <AdBanner type="banner" />

            {/* Official Links */}
            {detail?.officialLinks?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">🔗 Important Links</h2>
                <div className="links-grid">
                  {detail.officialLinks.map((l, i) => (
                    <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className="official-link">
                      {l.text}
                    </a>
                  ))}
                  <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link apply-link">
                    ✅ Apply Online
                  </a>
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                    📄 Full Notification
                  </a>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="disclaimer" style={{ marginTop: 24 }}>
              ℹ️ <strong>Disclaimer:</strong> Always verify all details on the official government website before applying.
              SarkariNaukriHubs.com is an information aggregator and is not affiliated with any government body.
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn apply-btn-lg">
                ✅ Apply Now on Official Website →
              </a>
            </div>
          </main>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="sidebar">
            <AdBanner type="rectangle" />

            <div className="sidebar-card">
              <div className="sidebar-title">⚡ Quick Info</div>
              <div style={{ padding: '12px 16px' }}>
                {[
                  ['Vacancies', detail?.vacancies || vacancies],
                  ['Last Date', detail?.lastDate || lastDate],
                  ['Salary', detail?.salary || salary],
                  ['Age Limit', detail?.ageLimit],
                  ['Application Fee', detail?.applicationFee],
                  ['Apply Mode', detail?.applyMode || 'Online'],
                  ['Category', category],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="quick-info-row">
                    <span className="qi-label">{k}</span>
                    <span className="qi-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">📂 More Jobs</div>
              <div className="portal-list">
                <a href="/" className="portal-item">📋 All Latest Jobs</a>
                <a href={`/?category=${category}`} className="portal-item">🔍 More {category} Jobs</a>
                <a href="/?section=admitcards" className="portal-item">🎫 Admit Cards</a>
                <a href="/?section=results" className="portal-item">📊 Results</a>
                <a href="/?section=answerkeys" className="portal-item">🔑 Answer Keys</a>
              </div>
            </div>

            <AdBanner type="rectangle" />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

function TableDisplay({ rows, highlight }) {
  if (!rows?.length) return null;
  const headers = rows[0];
  const body = rows.slice(1);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="detail-table">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className={highlight && row.some(c => c.toLowerCase().includes(highlight)) ? 'highlight-row' : ''}>
              {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
