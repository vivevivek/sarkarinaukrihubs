// lib/scrapers/domain-filter.js
// Ensures ONLY official government portal links appear on the site.
// Any link not matching the whitelist is silently dropped.

// ── WHITELIST — official domain patterns ─────────────────────────────────────
const ALLOWED = [
  '.gov.in', '.nic.in', '.edu.in', '.ac.in', '.org.in',
  // Bihar specific
  'bpsc.bih.nic.in', 'bssc.bihar.gov.in', 'bpssc.bih.nic.in',
  'btsc.bih.nic.in', 'statehealthsocietybihar.org',
  'patnahighcourt.gov.in', 'pmc.bihar.gov.in', 'aiimspatna.org',
  // UP specific
  'uppsc.up.nic.in', 'upsssc.gov.in', 'uppbpb.gov.in',
  'uprvunl.org', 'upjn.org',
  'allahabadhighcourt.in', 'lmrcl.com', 'upmrc.in',
  'aiimsgorakhpur.edu.in', 'aiimsraebareli.edu.in',
  // AIIMS
  'aiimsbhubaneswar.edu.in', 'aiimsjodhpur.edu.in',
  'aiimsnagpur.edu.in', 'aiimsrishikesh.edu.in',
  // Banking autonomous bodies
  'ibps.in', 'opportunities.rbi.org.in',
  // Railway PSUs
  'dfccil.com', 'rvnl.org', 'railtel.in', 'ircon.org',
  'rites.com', 'konkanrailway.com', 'irctc.co.in',
  // PSUs
  'careers.bhel.in', 'bel-india.in', 'bemlindia.in',
  'hal-india.co.in', 'mazdock.com', 'grse.in',
  'ongcindia.com', 'iocl.com', 'bpcl.in',
  'hindustanpetroleum.com', 'gailonline.com', 'oil-india.com',
  'ntpc.co.in', 'nhpcindia.com', 'powergrid.in',
  'sail.co.in', 'coalindia.in', 'nmdc.co.in', 'nalcoindia.com',
  'nbccindia.com', 'nhai.gov.in',
  'licindia.in', 'gicofindia.com', 'newindia.co.in', 'uiic.co.in',
  'ecgc.in', 'nabard.org', 'sidbi.in', 'eximbankindia.in',
  // Other official
  'indiapostgdsonline.gov.in', 'joinindianarmy.nic.in',
  'joinindiannavy.gov.in', 'indianairforce.nic.in',
  'agnipathvayu.cdac.in', 'joinindiancoastguard.cdac.in',
];

// ── BLOCKLIST — aggregators and news portals ──────────────────────────────────
// ── EXCLUDED — specific sites removed by admin ───────────────────────────────
const EXCLUDED = [
  'employmentnews.gov.in', 'nhmodisha.gov.in', 'upnrhm.gov.in',
  'upbasiceducationboard.gov.in', 'uppcl.org', 'upsessb.org',
  'sbpdcl.co.in', 'nbpdcl.co.in',
];

const BLOCKED = [
  'sarkariresult', 'freejobalert', 'jagranjosh', 'sarkariexam',
  'naukri.com', 'shine.com', 'rojgarresult', 'sarkariwallahs',
  'govtjobslatest', 'newjobs.in', 'hindustantimes', 'ndtv.com',
  'livehindustan', 'aajtak', 'amarujala', 'bhaskar.com',
  'patrika.com', 'firstpost', 'thehindu', 'indianexpress',
  'zeenews', 'abplive', 'news18', 'india.com',
  'testbook.com', 'adda247.com', 'gradeup.co',
];

// ── Check if a URL is from an official source ─────────────────────────────────
export function isOfficialLink(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    // Reject explicitly excluded domains
    if (EXCLUDED.some(e => host === e)) return false;

    // Reject blocklisted domains
    if (BLOCKED.some(b => host.includes(b))) return false;

    // Accept if matches any allowed pattern
    return ALLOWED.some(a => host.endsWith(a) || host === a.replace(/^\./, ''));
  } catch {
    return false;
  }
}

// ── Filter an array of links to only official ones ────────────────────────────
export function filterOfficialLinks(links) {
  return links.filter(l => isOfficialLink(typeof l === 'string' ? l : l.url));
}

// ── Extract official domain from URL ─────────────────────────────────────────
export function getOfficialDomain(url) {
  try { return new URL(url).hostname.toLowerCase(); }
  catch { return ''; }
}

// ── Find official PDF links on a cheerio-loaded page ─────────────────────────
export function findPDFLinks($, baseUrl) {
  const pdfs = [];
  $('a[href]').each((_, el) => {
    const href = $('').add(el).attr('href') || $(el).attr('href') || '';
    const full = href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;
    if (full.toLowerCase().endsWith('.pdf') && isOfficialLink(full)) {
      pdfs.push(full);
    }
  });
  return [...new Set(pdfs)]; // dedupe
}

// ── Find official apply/notification links (non-PDF) ─────────────────────────
export function findApplyLinks($, baseUrl) {
  const links = [];
  $('a[href]').each((_, el) => {
    const $el = $('').add(el).length ? $('').add(el) : { attr: (k) => $(el).attr(k), text: () => $(el).text() };
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    const full = href.startsWith('http') ? href : `${baseUrl}/${href.replace(/^\//, '')}`;

    if (
      isOfficialLink(full) &&
      !full.toLowerCase().endsWith('.pdf') &&
      (text.includes('apply') || text.includes('online') || text.includes('form') ||
       href.includes('apply') || href.includes('online') || href.includes('register'))
    ) {
      links.push({ text: $(el).text().trim(), url: full });
    }
  });
  return links.slice(0, 5);
}
