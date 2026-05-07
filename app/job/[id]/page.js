import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { AdBanner } from '../../components/AdBanner';
import { fetchJobById } from '../../../lib/db/supabase';

export const revalidate = 14400;

export async function generateMetadata({ params, searchParams }) {
  const p = await searchParams;
  const title = decodeURIComponent(p?.title || 'Sarkari Naukri Details');
  return {
    title: `${title} – SarkariNaukriHubs`,
    description: `Complete details: vacancies, eligibility, salary, important dates and apply link for ${title}.`,
  };
}

const DEFAULT_STEPS = [
  'Visit the official website link provided below',
  'Read the complete official notification PDF carefully',
  'Check eligibility — age limit, qualification, and category',
  'Click on the "Apply Online" link on the official portal',
  'Register using your email ID and mobile number',
  'Fill in all personal and educational details accurately',
  'Upload scanned photo, signature and required documents',
  'Pay the application fee through online payment (if applicable)',
  'Submit the form and save the confirmation page / application number',
  'Keep checking the official website for admit card and exam date',
];

const STATUS_STYLE = {
  'open':         { bg: '#e8f5e9', color: '#1b5e20', label: 'Open'         },
  'closing-soon': { bg: '#fff3e0', color: '#e65100', label: 'Closing Soon' },
  'closed':       { bg: '#ffebee', color: '#b71c1c', label: 'Closed'       },
  'upcoming':     { bg: '#e3f2fd', color: '#0d47a1', label: 'Upcoming'     },
};

export default async function JobDetailPage({ params, searchParams }) {
  const p = await searchParams;
  const jobId   = (await params)?.id || '';

  // Try Supabase first, fall back to URL params
  const dbJob   = jobId ? await fetchJobById(decodeURIComponent(jobId)) : null;

  const title     = dbJob?.title     || decodeURIComponent(p?.title    || 'Sarkari Job Notification');
  const category  = dbJob?.category  || decodeURIComponent(p?.cat      || '');
  const badge     = dbJob?.badge     || decodeURIComponent(p?.badge    || 'Official');
  const applyLink = dbJob?.apply_link|| decodeURIComponent(p?.link     || '');
  const org       = dbJob?.organization || decodeURIComponent(p?.org   || '');
  const lastDate  = dbJob?.last_date || decodeURIComponent(p?.lastDate || '');
  const vacancies = dbJob?.vacancies || decodeURIComponent(p?.vacancies|| '');
  const salary    = dbJob?.salary    || decodeURIComponent(p?.salary   || '');
  const source    = dbJob?.source    || decodeURIComponent(p?.source   || '');
  const ageLimit  = dbJob?.age_limit || '';
  const fee       = dbJob?.application_fee || '';
  const officialDomain = dbJob?.official_domain || '';

  const importantDates  = dbJob?.important_dates  || [];
  const vacancyTable    = dbJob?.vacancy_table    || [];
  const eligibilityList = dbJob?.eligibility_list || [];
  const feeTable        = dbJob?.fee_table        || [];
  const selectionSteps  = dbJob?.selection_steps  || [];
  const howToApply      = (dbJob?.how_to_apply?.length ? dbJob.how_to_apply : DEFAULT_STEPS);
  const officialLinks   = dbJob?.official_links   || [];

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div style={{ background:'#f8f6f2', borderBottom:'1px solid #e5e0d8', padding:'10px 20px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', fontSize:13, color:'#6b7280' }}>
          <a href="/" style={{ color:'#0d2137', textDecoration:'none', fontWeight:600 }}>Home</a>
          {category && <> &nbsp;›&nbsp; <a href={`/?category=${encodeURIComponent(category)}`} style={{ color:'#0d2137', textDecoration:'none' }}>{category}</a></>}
          &nbsp;›&nbsp; <span>Notification Detail</span>
        </div>
      </div>

      <div className="detail-page">
        <div className="detail-inner">
          <main className="detail-main">

            {/* ── Header Card ── */}
            <div className="detail-header-card">
              <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                    {badge && <span className="job-badge badge-official">{badge}</span>}
                    {category && <span className="job-badge badge-new">{category}</span>}
                    {lastDate && <span className="last-date-badge">⏰ Last Date: {lastDate}</span>}
                  </div>
                  <h1 className="detail-title">{title}</h1>
                  {org && <div className="detail-org">🏛️ {org}</div>}
                  {officialDomain && (
                    <div style={{ fontSize:12, color:'#4caf50', marginTop:6, fontWeight:600 }}>
                      ✅ Source: {officialDomain}
                    </div>
                  )}
                  <div className="detail-meta-row" style={{ marginTop:12 }}>
                    {vacancies && <span style={{ background:'#e3f2fd', color:'#1565c0', padding:'4px 12px', borderRadius:20, fontWeight:700, fontSize:13 }}>👥 {vacancies} Vacancies</span>}
                    {salary    && <span style={{ background:'#e8f5e9', color:'#1b5e20', padding:'4px 12px', borderRadius:20, fontWeight:600, fontSize:13 }}>💰 {salary}</span>}
                    {ageLimit  && <span style={{ background:'#fff3e0', color:'#e65100', padding:'4px 12px', borderRadius:20, fontWeight:600, fontSize:13 }}>🎂 {ageLimit}</span>}
                    {fee       && <span style={{ background:'#f3e5f5', color:'#6a1b9a', padding:'4px 12px', borderRadius:20, fontWeight:600, fontSize:13 }}>💳 Fee: {fee}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn">
                    ✅ Apply Now →
                  </a>
                  <button onClick={() => navigator?.share?.({ title, url: window?.location?.href })}
                    style={{ background:'#25D366', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    📤 Share
                  </button>
                </div>
              </div>
            </div>

            <AdBanner type="banner" />

            {/* ── Important Dates ── */}
            <div className="detail-section">
              <h2 className="detail-section-title">📅 Important Dates</h2>
              <div style={{ overflowX:'auto' }}>
                <table className="detail-table">
                  <thead><tr><th>Event</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {importantDates.length > 0 ? importantDates.map((d, i) => {
                      const s = STATUS_STYLE[d.status] || STATUS_STYLE['open'];
                      return (
                        <tr key={i}>
                          <td>{d.event}</td>
                          <td style={{ fontWeight:600 }}>{d.date}</td>
                          <td><span style={{ background:s.bg, color:s.color, padding:'2px 10px', borderRadius:12, fontSize:11, fontWeight:700 }}>{s.label}</span></td>
                        </tr>
                      );
                    }) : (
                      <>
                        {lastDate && <tr className="highlight-row"><td>Last Date to Apply</td><td style={{ fontWeight:700, color:'#e65100' }}>{lastDate}</td><td><span style={{ background:'#fff3e0', color:'#e65100', padding:'2px 10px', borderRadius:12, fontSize:11, fontWeight:700 }}>Check Now</span></td></tr>}
                        <tr><td>Notification Released</td><td>Check official website</td><td>—</td></tr>
                        <tr><td>Admit Card</td><td>To be announced</td><td>—</td></tr>
                        <tr><td>Exam Date</td><td>To be announced</td><td>—</td></tr>
                        <tr><td>Result</td><td>To be announced</td><td>—</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Vacancy Details ── */}
            {(vacancyTable.length > 0 || vacancies) && (
              <div className="detail-section">
                <h2 className="detail-section-title">👥 Vacancy Details</h2>
                <div style={{ overflowX:'auto' }}>
                  <table className="detail-table">
                    <thead><tr><th>Category</th><th>Number of Posts</th></tr></thead>
                    <tbody>
                      {vacancyTable.length > 0 ? vacancyTable.map((v, i) => (
                        <tr key={i} className={v.category === 'Total Posts' ? 'highlight-row' : ''}>
                          <td style={{ fontWeight: v.category === 'Total Posts' ? 700 : 400 }}>{v.category}</td>
                          <td style={{ fontWeight:700, color:'#1565c0' }}>{v.vacancies}</td>
                        </tr>
                      )) : (
                        <tr><td>Total Posts</td><td style={{ fontWeight:700, color:'#1565c0' }}>{vacancies}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Application Fee ── */}
            {(feeTable.length > 0 || fee) && (
              <div className="detail-section">
                <h2 className="detail-section-title">💳 Application Fee</h2>
                <div style={{ overflowX:'auto' }}>
                  <table className="detail-table">
                    <thead><tr><th>Category</th><th>Fee</th></tr></thead>
                    <tbody>
                      {feeTable.length > 0 ? feeTable.map((f, i) => (
                        <tr key={i}><td>{f.category}</td><td style={{ fontWeight:700 }}>{f.fee}</td></tr>
                      )) : (
                        <tr><td>Application Fee</td><td style={{ fontWeight:700 }}>{fee}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Eligibility ── */}
            {eligibilityList.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">🎓 Eligibility Criteria</h2>
                <ul className="detail-list">
                  {eligibilityList.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {/* ── Selection Process ── */}
            <div className="detail-section">
              <h2 className="detail-section-title">📊 Selection Process</h2>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', padding:'4px 0' }}>
                {(selectionSteps.length > 0 ? selectionSteps : ['Written Examination', 'Document Verification']).map((step, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'#0d2137', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                    <span style={{ fontSize:14, fontWeight:500 }}>{step}</span>
                    {i < (selectionSteps.length || 2) - 1 && <span style={{ color:'#9ca3af', fontSize:18 }}>›</span>}
                  </div>
                ))}
              </div>
            </div>

            <AdBanner type="banner" />

            {/* ── How to Apply ── */}
            <div className="detail-section">
              <h2 className="detail-section-title">✅ How to Apply</h2>
              <ol className="detail-list">
                {howToApply.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>

            {/* ── Documents Required ── */}
            <div className="detail-section">
              <h2 className="detail-section-title">📄 Documents Required</h2>
              <ul className="detail-list">
                {['10th / 12th Marksheet and Certificate','Graduation / Post-Graduation Degree (if required)','Aadhar Card / Voter ID (Identity Proof)','Domicile / Residence Certificate','Caste Certificate (SC/ST/OBC/EWS if applicable)','Recent Passport Size Photographs (coloured)','Signature on White Paper (scanned)','Experience Certificate (if applicable)','Disability Certificate (if applicable)','Bank details for fee payment'].map((d,i) => <li key={i}>{d}</li>)}
              </ul>
            </div>

            {/* ── Important Links ── */}
            <div className="detail-section">
              <h2 className="detail-section-title">🔗 Important Links</h2>
              <div className="links-grid">
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link apply-link">✅ Apply Online</a>
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link">📄 Official Notification</a>
                {officialLinks.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="official-link">{l.label}</a>
                ))}
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link">🌐 Official Website</a>
              </div>
            </div>

            <div className="disclaimer" style={{ marginTop:24 }}>
              ℹ️ All information is sourced directly from official government portals. Always verify details on the official website before submitting your application.
            </div>

            <div style={{ textAlign:'center', margin:'28px 0' }}>
              <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn apply-btn-lg">
                ✅ Apply on Official Website →
              </a>
            </div>
          </main>

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <AdBanner type="rectangle" />

            <div className="sidebar-card">
              <div className="sidebar-title">⚡ Quick Info</div>
              <div style={{ padding:'12px 16px' }}>
                {[['Organisation', org],['Total Vacancies',vacancies],['Last Date',lastDate],['Salary',salary],['Age Limit',ageLimit],['Application Fee',fee],['Apply Mode','Online'],['Category',category],['Source',source]].filter(([,v])=>v).map(([k,v])=>(
                  <div key={k} className="quick-info-row">
                    <span className="qi-label">{k}</span>
                    <span className="qi-value">{String(v).slice(0,45)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">📂 Browse More</div>
              <div className="portal-list">
                <a href="/" className="portal-item">📋 All Latest Jobs</a>
                {category && <a href={`/?category=${encodeURIComponent(category)}`} className="portal-item">🔍 More {category} Jobs</a>}
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
