// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/other-states.js
// Official state government portal scrapers.
// Covers MP, Rajasthan, Haryana, Punjab, and all remaining State PSCs.
// ─────────────────────────────────────────────────────────────────────────────

import {
  fetchHtml, clean, slug, makeJob,
  extractDate, extractVacancies, guessSection,
} from './utils.js';

// ── Generic NIC notice board scraper (reused for all state PSC sites) ─────────
async function scrapeStatePSC(base, url, source, state, category = 'State PSC') {
  const $ = await fetchHtml(url || base);
  const jobs = [];
  const seen = new Set();

  // NIC sites share a common HTML template — these selectors cover 95% of them
  const selectors = [
    'table.views-table tr td a', 'table tr td:first-child a',
    '.views-field-title a', '.field-content a',
    '.view-latest-news a', '#whats-new a',
    '.latest-notification a', '.notice-board a',
    'ul.list-unstyled li a', 'ul.notification-list li a',
    '#main-content a[href*=".pdf"]',
    '#main-content a[href*="notice"]',
    '#main-content a[href*="recruit"]',
    '#contentLeft a', '.panel a', '.well a',
  ];

  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (jobs.length >= 25) return false;
      const $el  = $(el);
      const text = clean($el.text());
      const href = $el.attr('href') || '';
      if (text.length < 12 || seen.has(text.slice(0, 50))) return;
      seen.add(text.slice(0, 50));
      const link = href.startsWith('http') ? href : `${base}${href.startsWith('/') ? '' : '/'}${href}`;
      const rowText = $el.closest('tr, li, div').text();
      jobs.push(makeJob({
        id:       `${slug(source)}-${i}-${slug(text)}`,
        title:    text.slice(0, 160),
        link,
        description: `${source} Official: ${text.slice(0, 200)}`,
        source,
        sourceUrl: url || base,
        badge:    'Official',
        category,
        section:  guessSection(text),
        lastDate: extractDate(rowText),
        vacancies: extractVacancies(rowText),
        organization: source,
        state,
      }));
    });
    if (jobs.length > 6) break;
  }
  return jobs;
}

// ═════════════════════════════════════════════════════════════════════════════
//  MADHYA PRADESH
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchMPPSC() {
  return scrapeStatePSC('https://mppsc.mp.gov.in', null, 'MPPSC', 'Madhya Pradesh');
}

export async function fetchMPESB() {
  return scrapeStatePSC('https://mpesb.mp.gov.in', null, 'MPESB', 'Madhya Pradesh');
}

export async function fetchMPPolice() {
  return scrapeStatePSC('https://mppolice.gov.in', null, 'MP Police', 'Madhya Pradesh', 'Defence');
}

// ═════════════════════════════════════════════════════════════════════════════
//  RAJASTHAN
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchRPSC() {
  return scrapeStatePSC('https://rpsc.rajasthan.gov.in', null, 'RPSC', 'Rajasthan');
}

export async function fetchRSSB() {
  // RSSB (Rajasthan Staff Selection Board) — Constable, Patwari, Lab Asst, JEN
  return scrapeStatePSC('https://rssb.rajasthan.gov.in', null, 'RSSB Rajasthan', 'Rajasthan');
}

// ═════════════════════════════════════════════════════════════════════════════
//  HARYANA
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchHPSC() {
  return scrapeStatePSC('https://hpsc.gov.in', null, 'HPSC', 'Haryana');
}

export async function fetchHSSC() {
  return scrapeStatePSC('https://hssc.gov.in', null, 'HSSC', 'Haryana');
}

// ═════════════════════════════════════════════════════════════════════════════
//  PUNJAB
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchPPSC() {
  return scrapeStatePSC('https://ppsc.gov.in', null, 'PPSC', 'Punjab');
}

export async function fetchPSSSB() {
  return scrapeStatePSC('https://sssb.punjab.gov.in', null, 'PSSSB', 'Punjab');
}

// ═════════════════════════════════════════════════════════════════════════════
//  WEST BENGAL
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchWBPSC() {
  return scrapeStatePSC('https://psc.wb.gov.in', null, 'WBPSC', 'West Bengal');
}

// ═════════════════════════════════════════════════════════════════════════════
//  TAMIL NADU
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchTNPSC() {
  return scrapeStatePSC('https://www.tnpsc.gov.in', null, 'TNPSC', 'Tamil Nadu');
}

// ═════════════════════════════════════════════════════════════════════════════
//  KERALA
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchKPSC() {
  return scrapeStatePSC('https://www.keralapsc.gov.in', null, 'KPSC Kerala', 'Kerala');
}

// ═════════════════════════════════════════════════════════════════════════════
//  KARNATAKA
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchKPSCKarnataka() {
  return scrapeStatePSC('https://www.kpsc.kar.nic.in', null, 'KPSC Karnataka', 'Karnataka');
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAHARASHTRA
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchMPSC() {
  return scrapeStatePSC('https://mpsc.gov.in', null, 'MPSC', 'Maharashtra');
}

// ═════════════════════════════════════════════════════════════════════════════
//  TELANGANA
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchTSPSC() {
  return scrapeStatePSC('https://www.tspsc.gov.in', null, 'TSPSC', 'Telangana');
}

// ═════════════════════════════════════════════════════════════════════════════
//  ANDHRA PRADESH
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchAPPSC() {
  return scrapeStatePSC('https://psc.ap.gov.in', null, 'APPSC', 'Andhra Pradesh');
}

// ═════════════════════════════════════════════════════════════════════════════
//  GUJARAT
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchGPSC() {
  return scrapeStatePSC('https://gpsc.gujarat.gov.in', null, 'GPSC', 'Gujarat');
}

// ── OJAS Gujarat (centralised recruitment portal for all Gujarat Govt jobs) ──
export async function fetchOJAS() {
  const BASE = 'https://ojas.gujarat.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('table tr, .job-list li, .notice-item').each((i, el) => {
    if (i > 30) return false;
    const $el  = $(el);
    const $a   = $el.find('a').first();
    const text = clean($a.text() || $el.text());
    const href = $a.attr('href') || '';
    if (text.length < 15) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    jobs.push(makeJob({
      id:       `ojas-${i}-${slug(text)}`,
      title:    text.slice(0, 160),
      link,
      source:   'OJAS Gujarat',
      sourceUrl: BASE,
      badge:    'Official',
      category: 'State PSC',
      section:  guessSection(text),
      state:    'Gujarat',
    }));
  });
  return jobs;
}

// ═════════════════════════════════════════════════════════════════════════════
//  HIMACHAL PRADESH
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchHPPSC() {
  return scrapeStatePSC('https://hppsc.hp.gov.in', null, 'HPPSC', 'Himachal Pradesh');
}

// ═════════════════════════════════════════════════════════════════════════════
//  UTTARAKHAND
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchUKPSC() {
  return scrapeStatePSC('https://psc.uk.gov.in', null, 'UKPSC', 'Uttarakhand');
}

export async function fetchUKSSC() {
  return scrapeStatePSC('https://sssc.uk.gov.in', null, 'UKSSSC', 'Uttarakhand');
}

// ═════════════════════════════════════════════════════════════════════════════
//  ASSAM
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchAPSC() {
  return scrapeStatePSC('https://apsc.nic.in', null, 'APSC', 'Assam');
}

// ═════════════════════════════════════════════════════════════════════════════
//  DELHI
// ═════════════════════════════════════════════════════════════════════════════

export async function fetchDSSSB() {
  return scrapeStatePSC('https://dsssb.delhi.gov.in', null, 'DSSSB', 'Delhi', 'State PSC');
}
