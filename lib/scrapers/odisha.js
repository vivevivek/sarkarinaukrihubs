// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/odisha.js
// Official portal scrapers for Odisha state portals.
// ─────────────────────────────────────────────────────────────────────────────

import {
  fetchHtml, clean, slug, makeJob,
  extractDate, extractVacancies, guessSection,
} from './utils.js';

async function scrapeOdishaPortal(base, url, source, category, badge = 'Official') {
  const $ = await fetchHtml(url || base);
  const jobs = [];
  const seen = new Set();

  const selectors = [
    'table tr td a', '.notice-board a', '.view-content a',
    '#whats-new a', '.latest-notification a',
    'ul.notification li a', '.panel-body a',
    'a[href*=".pdf"]', 'a[href*="notice"]', 'a[href*="recruit"]', 'a[href*="advt"]',
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
        description: `${source}: ${text.slice(0, 200)}`,
        source,
        sourceUrl: url || base,
        badge,
        category,
        section:  guessSection(text),
        lastDate: extractDate(rowText),
        vacancies: extractVacancies(rowText),
        organization: source,
        state:    'Odisha',
      }));
    });
    if (jobs.length > 6) break;
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. OPSC — Odisha Public Service Commission
//    Portal : https://www.opsc.gov.in
//    Exams  : OAS, OCS, OFS, Asst Section Officer, Lecturer
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchOPSC() {
  const BASE = 'https://www.opsc.gov.in';
  return scrapeOdishaPortal(BASE, BASE, 'OPSC', 'State PSC');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. OSSC — Odisha Staff Selection Commission
//    Portal : https://www.ossc.gov.in
//    Posts  : Group C posts across state departments
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchOSSC() {
  const BASE = 'https://www.ossc.gov.in';
  return scrapeOdishaPortal(BASE, BASE, 'OSSC', 'State PSC');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OSSSC — Odisha Sub-ordinate Staff Selection Commission
//    Portal : https://www.osssc.gov.in
//    Posts  : Revenue Inspector, LSI, Forest Guard, RI, Amin
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchOSSSC() {
  const BASE = 'https://www.osssc.gov.in';
  return scrapeOdishaPortal(BASE, BASE, 'OSSSC', 'State PSC');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Odisha Police
//    Portal : https://odishapolice.gov.in
//    Posts  : Constable, SI, ASI, Armed Police
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchOdishaPolice() {
  const BASE = 'https://odishapolice.gov.in';
  return scrapeOdishaPortal(BASE, BASE, 'Odisha Police', 'Defence');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NHM Odisha — National Health Mission Odisha
//    Portal : https://www.nhmodisha.gov.in
//    Posts  : CHO, ANM, Staff Nurse, Lab Tech, Pharmacist
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNHMOdisha() {
  const BASE = 'https://www.nhmodisha.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('a').each((i, el) => {
    if (jobs.length >= 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (
      text.length > 15 &&
      (href.includes('recruit') || href.includes('vacancy') || href.includes('.pdf') ||
       text.toLowerCase().includes('recruitment') || text.toLowerCase().includes('vacancy') ||
       text.toLowerCase().includes('notification'))
    ) {
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `nhm-odisha-${i}-${slug(text)}`,
        title:    text.slice(0, 150),
        link,
        source:   'NHM Odisha',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'Health',
        section:  guessSection(text),
        organization: 'National Health Mission Odisha',
        state:    'Odisha',
      }));
    }
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Orissa High Court
//    Portal : https://orissahighcourt.nic.in
//    Posts  : District Judge, Junior Clerk, Stenographer, Copyist
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchOrissaHC() {
  const BASE = 'https://orissahighcourt.nic.in';
  const URL  = `${BASE}/vacancy.php`;
  return scrapeOdishaPortal(BASE, URL, 'Orissa High Court', 'Judiciary');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AIIMS Bhubaneswar
//    Portal : https://aiimsbhubaneswar.edu.in
//    Posts  : Faculty, Non-Faculty, Nursing Officer, Group B & C
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAIIMSBhubaneswar() {
  const BASE = 'https://aiimsbhubaneswar.edu.in';
  const URL  = `${BASE}/Recruitment/Vacancies`;
  return scrapeOdishaPortal(BASE, URL, 'AIIMS Bhubaneswar', 'Health');
}
