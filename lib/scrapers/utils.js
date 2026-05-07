// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/utils.js
// Shared helpers used by every scraper.
// ─────────────────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio';

// ── Refresh / cache config ────────────────────────────────────────────────────
// How long (seconds) Next.js caches each scraper response.
// Change this ONE value to adjust all scrapers simultaneously.
//
// FREE hosting (Vercel Hobby, Render Free, Railway Free):
//   → 21600  (6 hours) — safe, ~4 refreshes/day, within free-tier limits
//
// LOW COST hosting (Vercel Pro, Railway Starter $5/mo, Render Starter):
//   → 7200   (2 hours) — ~12 refreshes/day, still very light
//
// PAID VPS / Dedicated (DigitalOcean $6+, Hetzner €4+):
//   → 3600   (1 hour)  — real-time feel, govt sites update at most daily
//
// NOTE: Government job notifications are posted at most 1-3 times per WEEK
// on each portal. 6 hours is MORE than fresh enough. Shorter intervals waste
// your bandwidth quota without any benefit.
export const CACHE_SECONDS = 21600; // ← change this one number only

// ── HTTP fetch with govt-friendly headers ────────────────────────────────────
// Many NIC / .gov.in sites return 403 with default fetch UA.
// Rotating through realistic UAs avoids soft-blocks.
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
];

let uaIndex = 0;
function nextUA() {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return ua;
}

export async function govFetch(url, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': nextUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Referer': new URL(url).origin + '/',
      ...extraHeaders,
    },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
  return res;
}

// ── Load HTML into cheerio ────────────────────────────────────────────────────
export async function fetchHtml(url) {
  const res = await govFetch(url);
  const html = await res.text();
  return cheerio.load(html);
}

// ── Load JSON from API ────────────────────────────────────────────────────────
export async function fetchJson(url, headers = {}) {
  const res = await govFetch(url, {
    Accept: 'application/json, text/plain, */*',
    ...headers,
  });
  return res.json();
}

// ── Text cleaning ─────────────────────────────────────────────────────────────
export function clean(s = '') {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Slug for deduplication IDs ────────────────────────────────────────────────
export function slug(s = '', prefix = '') {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 55);
  return prefix ? `${prefix}-${base}` : base;
}

// ── Guess section from title ──────────────────────────────────────────────────
export function guessSection(title = '') {
  const t = title.toLowerCase();
  if (/admit\s*card|hall\s*ticket|call\s*letter|e-admit/.test(t)) return 'admitcards';
  if (/\bresult\b|merit\s*list|cut\s*off|final\s*answer|marks\s*list/.test(t)) return 'results';
  if (/answer\s*key|provisional\s*key|final\s*key/.test(t)) return 'answerkeys';
  if (/syllabus|exam\s*pattern|scheme\s*of/.test(t)) return 'syllabus';
  return 'jobs';
}

// ── Guess job category from title ────────────────────────────────────────────
export function guessCategory(title = '', fallback = 'Central Government') {
  const t = title.toLowerCase();
  if (/\bupsc\b|civil service|ias\b|ips\b|ifs\b|nda\b|cds\b|capf\b|esc\b/.test(t)) return 'UPSC';
  if (/\bssc\b|staff selection|cgl\b|chsl\b|cpo\b|steno\b|mts\b/.test(t)) return 'SSC';
  if (/\bbank\b|ibps|sbi\b|rbi\b|nabard|sidbi|exim|lic\b|gic\b|insurance/.test(t)) return 'Banking';
  if (/railway|rrb\b|ntpc\b|loco pilot|group.d|alp\b|rpf\b|dfccil/.test(t)) return 'Railways';
  if (/army|navy|air force|agniveer|crpf|bsf\b|cisf|itbp|ssb\b|nsg\b|coast guard|military|soldier|constable|police/.test(t)) return 'Defence';
  if (/teacher|teaching|tet\b|ctet|ugc.net|pgt\b|tgt\b|kvs|nvs|primary\s*school/.test(t)) return 'Teaching';
  if (/\bpsc\b|state service|combined\s*state/.test(t)) return 'State PSC';
  if (/isro|drdo|barc|npcil|ecil|bsnl|bhel|ongc|ntpc|sail|coal india|psu/.test(t)) return 'PSU';
  return fallback;
}

// ── Extract last date from text ───────────────────────────────────────────────
export function extractDate(text = '') {
  const patterns = [
    /last\s*date[:\s]+([0-9]{1,2}[.\-/\s][A-Za-z0-9]{2,9}[.\-/\s][0-9]{2,4})/i,
    /closing\s*date[:\s]+([0-9]{1,2}[.\-/\s][A-Za-z0-9]{2,9}[.\-/\s][0-9]{2,4})/i,
    /apply\s*(?:before|by|till)[:\s]+([0-9]{1,2}[.\-/\s][A-Za-z0-9]{2,9}[.\-/\s][0-9]{2,4})/i,
    /([0-9]{1,2}[.\-/][0-9]{1,2}[.\-/][0-9]{2,4})/,
    /([0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[,\s]+[0-9]{4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim().slice(0, 30);
  }
  return '';
}

export function extractVacancies(text = '') {
  const m = text.match(/(\d[\d,]*)\s*(?:post|vacancy|vacancies|seat|opening|position)/i);
  return m ? m[1].replace(/,/g, '') : '';
}

export function extractSalary(text = '') {
  const m =
    text.match(/(?:pay\s*(?:scale|level|band)|salary|ctc|stipend)[:\s]+([₹\dRs.,\-\s–]+(?:per\s*month|p\.m\.|pm|pa|lakh)?)/i) ||
    text.match(/(?:Rs\.?|₹)\s*([\d,]+(?:\s*[-–]\s*[\d,]+)?)/);
  if (!m) return '';
  const raw = m[0].includes('₹') || m[0].includes('Rs') ? m[0] : `₹${m[1]}`;
  return raw.slice(0, 60).trim();
}

export function extractQualification(text = '') {
  const m = text.match(/(?:qualification|eligibility|education)[:\s]+([^.]{15,100})/i) ||
            text.match(/(?:graduate|12th|10th|degree|diploma|b\.tech|b\.e\.|mbbs)[^.]{0,60}/i);
  return m ? m[0].slice(0, 100).trim() : '';
}

export function extractAge(text = '') {
  const m = text.match(/(?:age\s*limit|age)[:\s]*([0-9]+\s*(?:to|[-–])\s*[0-9]+\s*years?)/i) ||
            text.match(/([0-9]+)\s*(?:to|[-–])\s*([0-9]+)\s*years/i);
  return m ? m[0].slice(0, 50).trim() : '';
}

// ── Build a standard Job object ───────────────────────────────────────────────
// Every scraper returns an array of these.
export function makeJob({
  id, title, link, description = '', pubDate = '',
  source, sourceUrl, category, badge = 'Official',
  section = null, organization = '', postName = '',
  lastDate = '', vacancies = '', salary = '',
  qualification = '', ageLimit = '', applicationFee = '',
  state = '',
}) {
  const sec = section ?? guessSection(title);
  return {
    id: id || slug(title, source?.toLowerCase().replace(/\s/g, '-')),
    title: title.slice(0, 160),
    link,
    description: description.slice(0, 400),
    pubDate,
    source,
    sourceUrl,
    category: category || guessCategory(title),
    badge,
    section: sec,
    organization: organization.slice(0, 100),
    postName: postName.slice(0, 100),
    lastDate,
    vacancies,
    salary,
    qualification,
    ageLimit,
    applicationFee,
    state,
    detailSourceUrl: link,
    applyMode: 'Online',
  };
}

// ── Deduplicate array of jobs by normalised title ─────────────────────────────
export function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    const key = j.title.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 65);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Sort jobs: newest first, fallback to source priority ─────────────────────
const SOURCE_RANK = {
  'UPSC': 0, 'SSC': 1, 'IBPS': 2, 'Employment News': 3,
  'NCS Portal': 4, 'SBI': 5, 'RBI': 6,
};
export function sortJobs(jobs) {
  return jobs.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate) : null;
    const db = b.pubDate ? new Date(b.pubDate) : null;
    if (da && db && Math.abs(da - db) > 86_400_000) return db - da;
    return (SOURCE_RANK[a.source] ?? 99) - (SOURCE_RANK[b.source] ?? 99);
  });
}

// ── Safe wrapper: returns [] instead of throwing ──────────────────────────────
export async function safe(name, fn) {
  try {
    const result = await fn();
    console.log(`[${name}] fetched ${result.length} items`);
    return result;
  } catch (err) {
    console.error(`[${name}] FAILED:`, err.message);
    return [];
  }
}
