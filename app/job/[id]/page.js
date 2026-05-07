import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { AdBanner } from '../../components/AdBanner';

export const revalidate = 14400;

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const title = decodeURIComponent(params?.title || 'Job Details');
  return {
    title: `${title} – SarkariNaukriHubs`,
    description: `Full details for ${title}: eligibility, vacancies, salary, important dates, and how to apply.`,
  };
}

export default async function JobDetailPage({ searchParams }) {
  const params = await searchParams;
  const title     = decodeURIComponent(params?.title    || 'Sarkari Job Notification');
  const category  = decodeURIComponent(params?.cat      || '');
  const badge     = decodeURIComponent(params?.badge    || '');
  const applyLink = decodeURIComponent(params?.link     || '');
  const org       = decodeURIComponent(params?.org      || '');
  const lastDate  = decodeURIComponent(params?.lastDate || '');
  const vacancies = decodeURIComponent(params?.vacancies|| '');
  const salary    = decodeURIComponent(params?.salary   || '');
  const source    = decodeURIComponent(params?.source   || '');

  return (
    <>
      <Header />
      <div style={{ background: '#f8f6f2', borderBottom: '1px solid #e5e0d8', padding: '10px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: 13, color: '#6b7280' }}>
          <a href="/" style={{ color: '#0d2137', textDecoration: 'none' }}>Home</a>
          {category && <> &rsaquo; <a href={`/?category=${encodeURIComponent(category)}`} style={{ color: '#0d2137', textDecoration: 'none' }}>{category}</a></>}
          &rsaquo; Job Detail
        </div>
      </div>

      <div className="detail-page">
        <div className="detail-inner">
          <main className="detail-main">
            <div className="detail-header-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  {badge && <span className="job-badge badge-new" style={{ display: 'inline-block', marginBottom: 10 }}>{badge}</span>}
                  <h1 className="detail-title">{title}</h1>
                  {org && <div className="detail-org">{org}</div>}
                  <div className="detail-meta-row">
                    {vacancies && <span>Vacancies: <strong>{vacancies}</strong></span>}
                    {salary && <span>Salary: {salary}</span>}
                    {lastDate && <span>Last Date: <strong style={{ color: '#e65100' }}>{lastDate}</strong></span>}
                    {category && <span>Category: {category}</span>}
                  </div>
                </div>
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn">Apply Now</a>
              </div>
            </div>

            <AdBanner type="banner" />

            <div className="detail-section">
              <h2 className="detail-section-title">Important Dates</h2>
              <table className="detail-table">
                <thead><tr><th>Event</th><th>Date</th></tr></thead>
                <tbody>
                  <tr><td>Notification Released</td><td>Check official website</td></tr>
                  {lastDate && <tr className="highlight-row"><td>Last Date to Apply</td><td>{lastDate}</td></tr>}
                  <tr><td>Admit Card</td><td>To be announced</td></tr>
                  <tr><td>Exam Date</td><td>To be announced</td></tr>
                  <tr><td>Result</td><td>To be announced</td></tr>
                </tbody>
              </table>
            </div>

            {vacancies && (
              <div className="detail-section">
                <h2 className="detail-section-title">Vacancy Details</h2>
                <table className="detail-table">
                  <thead><tr><th>Post Name</th><th>Total Vacancies</th><th>Apply Mode</th></tr></thead>
                  <tbody>
                    <tr><td>{org || title}</td><td>{vacancies}</td><td>Online</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="detail-section">
              <h2 className="detail-section-title">How to Apply</h2>
              <ol className="detail-list">
                <li>Click the Apply Now button above to visit the official website</li>
                <li>Find the recruitment notification for {org || title}</li>
                <li>Read the official notification PDF carefully before applying</li>
                <li>Check eligibility criteria - age limit, qualification, and experience</li>
                <li>Click on the online application link on the official portal</li>
                <li>Register with your mobile number and email ID</li>
                <li>Fill in personal details, educational qualifications, and work experience</li>
                <li>Upload scanned photo, signature, and required documents</li>
                <li>Pay the application fee online if applicable</li>
                <li>Submit and download the confirmation page for future reference</li>
              </ol>
            </div>

            <div className="detail-section">
              <h2 className="detail-section-title">Documents Required</h2>
              <ul className="detail-list">
                <li>10th / 12th Marksheet and Certificate</li>
                <li>Graduation / Post-Graduation Degree if required</li>
                <li>Aadhar Card / PAN Card</li>
                <li>Domicile / Residence Certificate</li>
                <li>Caste Certificate if applicable</li>
                <li>Recent Passport Size Photographs</li>
                <li>Signature on White Paper</li>
                <li>Experience Certificate if applicable</li>
              </ul>
            </div>

            <AdBanner type="banner" />

            <div className="detail-section">
              <h2 className="detail-section-title">Important Links</h2>
              <div className="links-grid">
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link apply-link">Apply Online</a>
                <a href={applyLink} target="_blank" rel="noopener noreferrer" className="official-link">Official Notification</a>
              </div>
            </div>

            <div className="disclaimer" style={{ marginTop: 24 }}>
              <strong>Disclaimer:</strong> Always verify all details on the official government website before applying.
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-btn apply-btn-lg">
                Apply Now on Official Website
              </a>
            </div>
          </main>

          <aside className="sidebar">
            <AdBanner type="rectangle" />
            <div className="sidebar-card">
              <div className="sidebar-title">Quick Info</div>
              <div style={{ padding: '12px 16px' }}>
                {[
                  ['Post', org || title.split(' ').slice(0,3).join(' ')],
                  ['Vacancies', vacancies],
                  ['Last Date', lastDate],
                  ['Salary', salary],
                  ['Category', category],
                  ['Apply Mode', 'Online'],
                  ['Source', source],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="quick-info-row">
                    <span className="qi-label">{k}</span>
                    <span className="qi-value">{String(v).slice(0, 40)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-card">
              <div className="sidebar-title">More Jobs</div>
              <div className="portal-list">
                <a href="/" className="portal-item">All Latest Jobs</a>
                {category && <a href={`/?category=${encodeURIComponent(category)}`} className="portal-item">More {category} Jobs</a>}
                <a href="/?section=admitcards" className="portal-item">Admit Cards</a>
                <a href="/?section=results" className="portal-item">Results</a>
                <a href="/?section=answerkeys" className="portal-item">Answer Keys</a>
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