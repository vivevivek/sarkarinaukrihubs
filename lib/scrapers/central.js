// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/central.js
// Scrapers for central government official portals ONLY.
// All URLs are .gov.in / .nic.in / official PSU domains.
// ─────────────────────────────────────────────────────────────────────────────

import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import {
  govFetch, fetchHtml, fetchJson, clean, slug, makeJob,
  extractDate, extractVacancies, extractSalary, extractQualification,
  extractAge, guessSection, CACHE_SECONDS,
} from './utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. EMPLOYMENT NEWS  (Official RSS Feed — most reliable source)
//    Portal : https://www.employmentnews.gov.in
//    Method : RSS/XML  ← only govt portal with a public RSS feed
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchEmploymentNews() {
  const url = 'https://www.employmentnews.gov.in/NewEmp/RSSFeed.aspx';
  const res  = await govFetch(url, { Accept: 'application/rss+xml, application/xml, text/xml' });
  const xml  = await res.text();
  const parsed = await parseStringPromise(xml, { explicitArray: false });
  const raw    = parsed?.rss?.channel?.item;
  const items  = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return items.map((item, i) => {
    const title = clean(item.title || '');
    const desc  = clean(item.description || '');
    return makeJob({
      id:            `empnews-${i}-${slug(title)}`,
      title,
      link:          (item.link || '').trim(),
      description:   desc.slice(0, 350),
      pubDate:       item.pubDate || '',
      source:        'Employment News',
      sourceUrl:     'https://www.employmentnews.gov.in',
      badge:         'Official',
      section:       guessSection(title),
      lastDate:      extractDate(desc),
      vacancies:     extractVacancies(desc),
      salary:        extractSalary(desc),
      qualification: extractQualification(desc),
      ageLimit:      extractAge(desc),
      state:         'Central',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NCS PORTAL  (Govt JSON API — Ministry of Labour & Employment)
//    Portal : https://www.ncs.gov.in
//    Method : JSON API
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNCS() {
  const url  = 'https://www.ncs.gov.in/jobseeker/SearchJob?jobType=G&pageNo=1&pageSize=40';
  const data = await fetchJson(url);

  // NCS API response shape varies; try common keys
  const jobs = data?.jobs || data?.data || data?.result || data?.jobList || [];
  return jobs.slice(0, 40).map((j, i) => makeJob({
    id:            `ncs-${i}-${slug(j.jobTitle || '')}`,
    title:         j.jobTitle || j.title || j.PostName || 'Government Job',
    link:          `https://www.ncs.gov.in/jobseeker/JobDetails/${j.jobId || j.id || ''}`,
    description:   [j.orgName, j.qualification, j.salary].filter(Boolean).join(' | '),
    pubDate:       j.postingDate || j.createdDate || '',
    source:        'NCS Portal',
    sourceUrl:     'https://www.ncs.gov.in',
    badge:         'NCS',
    organization:  j.orgName || '',
    lastDate:      j.lastDate || j.expiryDate || '',
    vacancies:     String(j.vacancy || j.noOfVacancy || ''),
    salary:        j.salary || j.ctc || '',
    qualification: j.qualification || j.minQualification || '',
    ageLimit:      j.ageLimit || '',
    state:         j.stateName || 'Central',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPSC — Union Public Service Commission
//    Portal : https://www.upsc.gov.in
//    Method : HTML — stable NIC table layout
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUPSC() {
  const BASE = 'https://www.upsc.gov.in';
  const $    = await fetchHtml(`${BASE}/examinations/active-examinations`);
  const jobs = [];

  // UPSC uses a table listing active exams with notification links
  $('table tr, .exam-list li, .view-content .views-row').each((i, el) => {
    if (i > 30) return false;
    const $el   = $(el);
    const $a    = $el.find('a').first();
    const title = clean($a.text() || $el.find('td').first().text());
    const href  = $a.attr('href') || '';
    const link  = href.startsWith('http') ? href : `${BASE}${href}`;
    const rowText = $el.text();

    if (title.length < 15 || !href) return;
    jobs.push(makeJob({
      id:       `upsc-${i}-${slug(title)}`,
      title,
      link,
      description:  `UPSC Recruitment: ${title}. Check official notification for eligibility and apply online at upsc.gov.in`,
      source:       'UPSC',
      sourceUrl:    BASE,
      badge:        'Official',
      section:      guessSection(title),
      lastDate:     extractDate(rowText),
      organization: 'Union Public Service Commission',
      state:        'Central',
    }));
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SSC — Staff Selection Commission
//    Portal : https://ssc.gov.in
//    Method : HTML — notice board list
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchSSC() {
  const BASE = 'https://ssc.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  // SSC homepage has a Latest News / What's New section
  const selectors = [
    '#latest-notification a', '.latest-news a', '.whatsnew a',
    '.news-events a', '#whats-new a', '.notification-list a',
    'ul.list-unstyled li a', '.view-latest-news a',
  ];

  let found = false;
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (i > 35) return false;
      const $el  = $(el);
      const title = clean($el.text());
      const href  = $el.attr('href') || '';
      const link  = href.startsWith('http') ? href : `${BASE}${href}`;
      if (title.length < 15) return;
      found = true;
      jobs.push(makeJob({
        id:       `ssc-${i}-${slug(title)}`,
        title,
        link,
        description:  `SSC Notification: ${title}. Check official website ssc.gov.in for full details and online application.`,
        source:       'SSC',
        sourceUrl:    BASE,
        badge:        'Official',
        section:      guessSection(title),
        organization: 'Staff Selection Commission',
        state:        'Central',
      }));
    });
    if (found) break;
  }

  // Fallback: grab all anchors with "recruitment" / "notification" in href or text
  if (!found) {
    $('a').each((i, el) => {
      const $el  = $(el);
      const text = clean($el.text());
      const href = $el.attr('href') || '';
      if (
        text.length > 20 &&
        (href.includes('notice') || href.includes('recruit') || text.toLowerCase().includes('recruitment'))
      ) {
        const link = href.startsWith('http') ? href : `${BASE}${href}`;
        jobs.push(makeJob({
          id:       `ssc-fb-${i}-${slug(text)}`,
          title:    text.slice(0, 150),
          link,
          source:   'SSC',
          sourceUrl: BASE,
          badge:    'Official',
          section:  guessSection(text),
          organization: 'Staff Selection Commission',
          state:    'Central',
        }));
        if (jobs.length > 25) return false;
      }
    });
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. IBPS — Institute of Banking Personnel Selection
//    Portal : https://www.ibps.in
//    Method : HTML — announcements section
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchIBPS() {
  const BASE = 'https://www.ibps.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  const selectors = [
    '.latest-notification a', '#latest-news a',
    '.marquee a', '.news-scroll a',
    '.home-notification a', 'ul.notification-list li a',
    '.ibps-latest a',
  ];

  let found = false;
  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (i > 30) return false;
      const $el  = $(el);
      const title = clean($el.text());
      const href  = $el.attr('href') || '';
      if (title.length < 15) return;
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      found = true;
      jobs.push(makeJob({
        id:       `ibps-${i}-${slug(title)}`,
        title,
        link,
        description:  `IBPS Official Notification: ${title}. Apply online at ibps.in`,
        source:       'IBPS',
        sourceUrl:    BASE,
        badge:        'Official',
        category:     'Banking',
        section:      guessSection(title),
        organization: 'IBPS',
        state:        'Central',
      }));
    });
    if (found) break;
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SBI — State Bank of India Careers
//    Portal : https://sbi.co.in/web/careers
//    Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchSBI() {
  const BASE = 'https://sbi.co.in';
  const URL  = `${BASE}/web/careers`;
  const $    = await fetchHtml(URL);
  const jobs = [];

  $('a').each((i, el) => {
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (
      text.length > 20 &&
      (href.includes('career') || href.includes('recruit') || href.includes('notification') ||
       text.toLowerCase().includes('recruitment') || text.toLowerCase().includes('apply'))
    ) {
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `sbi-${i}-${slug(text)}`,
        title:    text.slice(0, 150),
        link,
        source:   'SBI',
        sourceUrl: URL,
        badge:    'Official',
        category: 'Banking',
        section:  guessSection(text),
        organization: 'State Bank of India',
        state:    'Central',
      }));
    }
    if (jobs.length >= 25) return false;
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RBI — Reserve Bank of India
//    Portal : https://opportunities.rbi.org.in
//    Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchRBI() {
  const BASE = 'https://opportunities.rbi.org.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('table tr, .opportunity-list li, .notice a, a[href*="vacancy"], a[href*="recruit"]').each((i, el) => {
    if (i > 25) return false;
    const $el  = $(el);
    const $a   = el.tagName === 'a' ? $el : $el.find('a').first();
    const title = clean($a.text() || $el.find('td').first().text());
    const href  = $a.attr('href') || '';
    if (title.length < 15 || !href) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    jobs.push(makeJob({
      id:       `rbi-${i}-${slug(title)}`,
      title,
      link,
      source:   'RBI',
      sourceUrl: BASE,
      badge:    'Official',
      category: 'Banking',
      section:  guessSection(title),
      organization: 'Reserve Bank of India',
      state:    'Central',
    }));
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. INDIA POST GDS — Gramin Dak Sevak Online Portal
//    Portal : https://indiapostgdsonline.gov.in
//    Method : HTML — dedicated GDS recruitment portal
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchIndiaPostGDS() {
  const BASE = 'https://indiapostgdsonline.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('a, .notification-item, tr td a').each((i, el) => {
    if (i > 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (text.length < 10) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    jobs.push(makeJob({
      id:       `gds-${i}-${slug(text)}`,
      title:    text.length > 20 ? text.slice(0, 150) : `India Post GDS Recruitment – ${text}`,
      link:     link || BASE,
      description: 'Gramin Dak Sevak (GDS) recruitment by India Post. Thousands of vacancies across all circles.',
      source:   'India Post GDS',
      sourceUrl: BASE,
      badge:    'Official',
      category: 'Central Government',
      organization: 'Department of Posts, India',
      state:    'Central',
    }));
  });

  // Always include at least the main GDS portal as a job entry
  if (!jobs.length) {
    jobs.push(makeJob({
      id:       'gds-main',
      title:    'India Post – Gramin Dak Sevak (GDS) Recruitment',
      link:     BASE,
      description: 'Latest GDS recruitment notification by India Post for all postal circles. Apply online at indiapostgdsonline.gov.in',
      source:   'India Post GDS',
      sourceUrl: BASE,
      badge:    'Official',
      organization: 'Department of Posts, India',
      state:    'Central',
    }));
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. INDIAN ARMY
//    Portal : https://joinindianarmy.nic.in
//    Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchArmy() {
  const BASE = 'https://joinindianarmy.nic.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  const selectors = [
    '.recruitment-list a', '.notification-list a', '.news-list a',
    'table.recruitment tr td a', '.latest-news a', '.what-new a',
    '#contentLeft a', '.panel-body a',
  ];

  for (const sel of selectors) {
    $(sel).each((i, el) => {
      if (jobs.length >= 20) return false;
      const $el  = $(el);
      const title = clean($el.text());
      const href  = $el.attr('href') || '';
      if (title.length < 12) return;
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `army-${i}-${slug(title)}`,
        title,
        link,
        source:   'Indian Army',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'Defence',
        section:  guessSection(title),
        organization: 'Indian Army',
        state:    'Central',
      }));
    });
    if (jobs.length > 5) break;
  }
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. INDIAN NAVY
//     Portal : https://www.joinindiannavy.gov.in
//     Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNavy() {
  const BASE = 'https://www.joinindiannavy.gov.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('a').each((i, el) => {
    if (jobs.length >= 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (
      text.length > 15 &&
      (text.toLowerCase().includes('recruit') || text.toLowerCase().includes('apply') ||
       text.toLowerCase().includes('notification') || href.includes('recruit'))
    ) {
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `navy-${i}-${slug(text)}`,
        title:    text.slice(0, 150),
        link,
        source:   'Indian Navy',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'Defence',
        section:  guessSection(text),
        organization: 'Indian Navy',
        state:    'Central',
      }));
    }
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. DRDO — Defence Research & Development Organisation
//     Portal : https://www.drdo.gov.in/careers
//     Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchDRDO() {
  const BASE = 'https://www.drdo.gov.in';
  const URL  = `${BASE}/careers`;
  const $    = await fetchHtml(URL);
  const jobs = [];

  $('a[href], .career-item, table tr td a').each((i, el) => {
    if (jobs.length >= 25) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (text.length < 15) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    jobs.push(makeJob({
      id:       `drdo-${i}-${slug(text)}`,
      title:    text.slice(0, 150),
      link,
      source:   'DRDO',
      sourceUrl: URL,
      badge:    'Official',
      category: 'PSU',
      section:  guessSection(text),
      organization: 'DRDO – Ministry of Defence',
      state:    'Central',
    }));
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. ISRO — Indian Space Research Organisation
//     Portal : https://www.isro.gov.in/Careers.html
//     Method : HTML — table-based listing
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchISRO() {
  const BASE = 'https://www.isro.gov.in';
  const URL  = `${BASE}/Careers.html`;
  const $    = await fetchHtml(URL);
  const jobs = [];

  $('table tr, .career-notice, ul.career-list li').each((i, el) => {
    if (i > 30) return false;
    const $el  = $(el);
    const $a   = $el.find('a').first();
    const title = clean($a.text() || $el.find('td').first().text());
    const href  = $a.attr('href') || '';
    if (title.length < 15) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    const rowText = $el.text();
    jobs.push(makeJob({
      id:       `isro-${i}-${slug(title)}`,
      title,
      link,
      description:  `ISRO Recruitment: ${title}. Apply at isro.gov.in`,
      source:       'ISRO',
      sourceUrl:    URL,
      badge:        'Official',
      category:     'PSU',
      section:      guessSection(title),
      lastDate:     extractDate(rowText),
      organization: 'Indian Space Research Organisation',
      state:        'Central',
    }));
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. FCI — Food Corporation of India
//     Portal : https://fci.gov.in/recruitments.php
//     Method : HTML — table listing
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchFCI() {
  const BASE = 'https://fci.gov.in';
  const URL  = `${BASE}/recruitments.php`;
  const $    = await fetchHtml(URL);
  const jobs = [];

  $('table tr').each((i, el) => {
    if (i === 0 || i > 30) return; // skip header
    const $el  = $(el);
    const $a   = $el.find('a').first();
    const title = clean($a.text() || $el.find('td').first().text());
    const href  = $a.attr('href') || '';
    if (title.length < 15) return;
    const link = href.startsWith('http') ? href : `${BASE}/${href.replace(/^\//, '')}`;
    const cells = $el.find('td').map((_, td) => $(td).text().trim()).get();
    jobs.push(makeJob({
      id:       `fci-${i}-${slug(title)}`,
      title,
      link,
      description:  `FCI Recruitment: ${title}. Manager, JE, Watchman, Depot posts. Apply at fci.gov.in`,
      source:       'FCI',
      sourceUrl:    URL,
      badge:        'Official',
      category:     'Central Government',
      section:      guessSection(title),
      lastDate:     cells.find(c => /\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(c)) || '',
      organization: 'Food Corporation of India',
      state:        'Central',
    }));
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. KVS — Kendriya Vidyalaya Sangathan
//     Portal : https://kvsangathan.nic.in
//     Method : HTML — notice board
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchKVS() {
  const BASE = 'https://kvsangathan.nic.in';
  const $    = await fetchHtml(BASE);
  const jobs = [];

  $('a').each((i, el) => {
    if (jobs.length >= 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (
      text.length > 20 &&
      (text.toLowerCase().includes('recruit') || text.toLowerCase().includes('teacher') ||
       text.toLowerCase().includes('notification') || text.toLowerCase().includes('vacancy'))
    ) {
      const link = href.startsWith('http') ? href : `${BASE}${href}`;
      jobs.push(makeJob({
        id:       `kvs-${i}-${slug(text)}`,
        title:    text.slice(0, 150),
        link,
        source:   'KVS',
        sourceUrl: BASE,
        badge:    'Official',
        category: 'Teaching',
        section:  guessSection(text),
        organization: 'Kendriya Vidyalaya Sangathan',
        state:    'Central',
      }));
    }
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. ESIC — Employees' State Insurance Corporation
//     Portal : https://esic.nic.in/recruitment
//     Method : HTML
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchESIC() {
  const BASE = 'https://esic.nic.in';
  const URL  = `${BASE}/recruitment`;
  const $    = await fetchHtml(URL);
  const jobs = [];

  $('table tr td a, .notification-list a, ul li a').each((i, el) => {
    if (jobs.length >= 20) return false;
    const $el  = $(el);
    const text = clean($el.text());
    const href = $el.attr('href') || '';
    if (text.length < 15) return;
    const link = href.startsWith('http') ? href : `${BASE}${href}`;
    jobs.push(makeJob({
      id:       `esic-${i}-${slug(text)}`,
      title:    text.slice(0, 150),
      link,
      source:   'ESIC',
      sourceUrl: URL,
      badge:    'Official',
      category: 'Health',
      section:  guessSection(text),
      organization: 'Employees State Insurance Corporation',
      state:    'Central',
    }));
  });
  return jobs;
}
