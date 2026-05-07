// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/bihar-up.js
// Official portal scrapers for Bihar, Uttar Pradesh, and Jharkhand.
// These states account for the highest Sarkari Naukri search traffic in India.
// All URLs are official .gov.in / .nic.in / state government domains.
// ─────────────────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio';
import {
  fetchHtml, clean, slug, makeJob,
  extractDate, extractVacancies, guessSection, CACHE_SECONDS,
} from './utils.js';

// ── Shared helper: scrape a NIC-style notice board ────────────────────────────
// Most state government NIC websites use identical HTML templates.
// This function handles them all with fallback selectors.
async function scrapeNICNoticeBoard(base, url, source, category, state, badge = 'Official') {
  const $ = await fetchHtml(url || base);
  const jobs = [];

  // NIC notice boards commonly use these patterns:
  const selectors = [
    'table.views-table tr td a',
    'table tr td a',
    '.view-content .views-row a',
    '.field-content a',
    'ul.notification-list li a',
    '.latest-notification a',
    '#contentLeft a',
    '.news-section a',
    'marquee a',
    '.panel-body a',
    'div.content a',
    'a[href*=".pdf"]',    // many govt sites link directly to PDF notifications
    'a[href*="notice"]',
    'a[href*="recruit"]',
    'a[href*="notification"]',
    'a[href*="advt"]',
    'a[href*="advtno"]',
  ];

  const seen = new Set();
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (jobs.length >= 30) return false;
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
        description: `${source} Official Notification: ${text.slice(0, 200)}. Check official portal for details.`,
        source,
        sourceUrl:    url || base,
        badge,
        category,
        section:  guessSection(text),
        lastDate: extractDate(rowText),
        vacancies: extractVacancies(rowText),
        organization: source,
        state,
      }));
    });
    if (jobs.length > 8) break; // found enough from this selector, stop trying others
  }
  return jobs;
}

// ═════════════════════════════════════════════════════════════════════════════
//  BIHAR STATE PORTALS
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. BPSC — Bihar Public Service Commission
//    Portal : https://www.bpsc.bih.nic.in
//    Exams  : CCE (Combined Competitive Exam), Lecturer, AAO, Asst Engineer
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchBPSC() {
  const BASE = 'https://www.bpsc.bih.nic.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'BPSC', 'State PSC', 'Bihar');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BSSC — Bihar Staff Selection Commission
//    Portal : https://bssc.bihar.gov.in
//    Exams  : Inter-Level, Graduate Level, various Group C posts
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchBSSC() {
  const BASE = 'https://bssc.bihar.gov.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'BSSC', 'State PSC', 'Bihar');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BPSSC — Bihar Police Subordinate Services Commission
//    Portal : https://bpssc.bih.nic.in
//    Posts  : Constable, Sub-Inspector, Sergeant — huge applicant pool
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchBPSSC() {
  const BASE = 'https://bpssc.bih.nic.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'Bihar Police (BPSSC)', 'Defence', 'Bihar', 'Official');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BTSC — Bihar Technical Service Commission
//    Portal : https://btsc.bih.nic.in
//    Posts  : ANM, Staff Nurse, Pharmacist, Lab Technician — health sector
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchBTSC() {
  const BASE = 'https://btsc.bih.nic.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'BTSC Bihar', 'Health', 'Bihar');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NHM Bihar — State Health Society Bihar
//    Portal : https://statehealthsocietybihar.org
//    Posts  : CHO, ANM, ASHA Facilitator, Staff Nurse, Lab Technician
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNHMBihar() {
  const BASE = 'https://statehealthsocietybihar.org';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  // NHM portals typically have a recruitment / vacancy section
  $('a').each((i, el) => {
    if (jobs.length >= 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (
      text.length > 15 &&
      (text.toLowerCase().includes('recruit') || text.toLowerCase().includes('vacancy') ||
       text.toLowerCase().includes('notification') || text.toLowerCase().includes('apply') ||
       href.includes('recruit') || href.includes('vacancy') || href.includes('.pdf'))
    ) {
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `nhm-bihar-${i}-${slug(text)}`,
        title:    text.slice(0, 150),
        link,
        description: `NHM Bihar Official: ${text}. Health sector recruitment in Bihar.`,
        source:   'NHM Bihar',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'Health',
        section:  guessSection(text),
        organization: 'State Health Society Bihar',
        state:    'Bihar',
      }));
    }
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. AIIMS Patna
//    Portal : https://aiimspatna.org/recruitment
//    Posts  : Nursing Officer, Senior Resident, Faculty, Group B & C
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAIIMSPatna() {
  const BASE = 'https://aiimspatna.org';
  const URL  = `${BASE}/recruitment`;
  return scrapeNICNoticeBoard(BASE, URL, 'AIIMS Patna', 'Health', 'Bihar');
}


// ═════════════════════════════════════════════════════════════════════════════
//  UTTAR PRADESH STATE PORTALS
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 8. UPPSC — Uttar Pradesh Public Service Commission
//    Portal : https://uppsc.up.nic.in
//    Exams  : PCS, RO/ARO, AHC Review Officer, Lecturer, Asst Conservator
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUPPSC() {
  const BASE = 'https://uppsc.up.nic.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'UPPSC', 'State PSC', 'Uttar Pradesh');
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. UPSSSC — UP Subordinate Service Selection Commission
//    Portal : https://upsssc.gov.in
//    Posts  : Lekhpal, Forest Guard, VDO, Gram Panchayat Adhikari, Junior Asst
//    Note   : One of the highest-traffic state portals in India
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUPSSC() {
  const BASE = 'https://upsssc.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  // UPSSSC has a specific "Advertisments" / "Notices" section
  const selectors = [
    '.advertisment-section a', '.notice-board a',
    'table tr td a', '#advertisement a',
    '.notication-row a', 'ul.list-group li a',
    'a[href*="advt"]', 'a[href*="notice"]', 'a[href*="recruit"]',
  ];

  const seen = new Set();
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (jobs.length >= 25) return false;
      const $el  = $(el);
      const text = clean($el.text());
      const href = $el.attr('href') || '';
      if (text.length < 12 || seen.has(text.slice(0, 50))) return;
      seen.add(text.slice(0, 50));
      const link = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
      jobs.push(makeJob({
        id:       `upsssc-${i}-${slug(text)}`,
        title:    text.slice(0, 160),
        link,
        source:   'UPSSSC',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'State PSC',
        section:  guessSection(text),
        organization: 'UP Subordinate Service Selection Commission',
        state:    'Uttar Pradesh',
      }));
    });
    if (jobs.length > 8) break;
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. UP POLICE — UP Police Recruitment & Promotion Board (UPPBPB)
//     Portal : https://uppbpb.gov.in
//     Posts  : Constable, Sub-Inspector, Head Constable
//     Note   : UP Police Constable draws 30-50 lakh applicants per cycle
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUPPolice() {
  const BASE = 'https://uppbpb.gov.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'UP Police (UPPBPB)', 'Defence', 'Uttar Pradesh', 'Official');
}





// ─────────────────────────────────────────────────────────────────────────────
// 15. AIIMS Gorakhpur
//     Portal : https://aiimsgorakhpur.edu.in
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAIIMSGorakhpur() {
  const BASE = 'https://aiimsgorakhpur.edu.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'AIIMS Gorakhpur', 'Health', 'Uttar Pradesh');
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. AIIMS Raebareli
//     Portal : https://www.aiimsraebareli.edu.in
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAIIMSRaebareli() {
  const BASE = 'https://www.aiimsraebareli.edu.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'AIIMS Raebareli', 'Health', 'Uttar Pradesh');
}

// ═════════════════════════════════════════════════════════════════════════════
//  JHARKHAND STATE PORTALS
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 17. JPSC — Jharkhand Public Service Commission
//     Portal : https://www.jpsc.gov.in
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchJPSC() {
  const BASE = 'https://www.jpsc.gov.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'JPSC', 'State PSC', 'Jharkhand');
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. JSSC — Jharkhand Staff Selection Commission
//     Portal : https://jssc.nic.in
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchJSSC() {
  const BASE = 'https://jssc.nic.in';
  return scrapeNICNoticeBoard(BASE, BASE, 'JSSC', 'State PSC', 'Jharkhand');
}
