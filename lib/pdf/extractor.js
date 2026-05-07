// lib/pdf/extractor.js
// Fetches official government PDFs and extracts structured data.
// Uses pdf-parse (npm) for text extraction + smart regex for field parsing.
// No external AI APIs needed — fully deterministic extraction.

import { govFetch } from '../scrapers/utils.js';

// ── Fetch PDF and extract raw text ───────────────────────────────────────────
export async function extractTextFromPDF(pdfUrl) {
  try {
    const res = await govFetch(pdfUrl, { Accept: 'application/pdf,*/*' });
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic import of pdf-parse (avoids build issues)
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const data = await pdfParse(buffer, { max: 20 }); // max 20 pages
    return data.text || '';
  } catch (e) {
    console.error(`[PDF] Failed to parse ${pdfUrl}:`, e.message);
    return '';
  }
}

// ── Extract structured fields from raw PDF text ──────────────────────────────
export function parseNotificationText(text) {
  if (!text || text.length < 50) return null;

  return {
    importantDates:   extractImportantDates(text),
    vacancyTable:     extractVacancyTable(text),
    eligibilityList:  extractEligibility(text),
    feeTable:         extractFeeTable(text),
    selectionSteps:   extractSelectionProcess(text),
    howToApply:       extractHowToApply(text),
    lastDate:         extractLastDate(text),
    vacancies:        extractTotalVacancies(text),
    salary:           extractSalary(text),
    qualification:    extractQualification(text),
    ageLimit:         extractAgeLimit(text),
    applicationFee:   extractFeeSimple(text),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

function extractImportantDates(text) {
  const dates = [];
  const datePatterns = [
    { key: /online.{0,20}apply.{0,20}start|application.{0,15}open|apply.{0,15}from/i, label: 'Application Start Date' },
    { key: /last.{0,10}date|closing.{0,10}date|apply.{0,10}(?:before|by|till)/i, label: 'Last Date to Apply' },
    { key: /last.{0,10}date.{0,20}fee|fee.{0,20}payment/i, label: 'Last Date for Fee Payment' },
    { key: /(?:written\s+)?exam.{0,15}date|examination.{0,15}date|test.{0,10}date/i, label: 'Exam Date' },
    { key: /admit\s*card|hall\s*ticket|call\s*letter/i, label: 'Admit Card Date' },
    { key: /result.{0,15}date|result.{0,15}declared/i, label: 'Result Date' },
    { key: /interview.{0,15}date/i, label: 'Interview Date' },
    { key: /document.{0,15}verif/i, label: 'Document Verification' },
  ];

  const dateRegex = /(\d{1,2}[\s./-](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s./-]\d{2,4}|\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/gi;

  for (const { key, label } of datePatterns) {
    const idx = text.search(key);
    if (idx === -1) continue;
    const nearby = text.slice(Math.max(0, idx - 30), idx + 120);
    const match = nearby.match(dateRegex);
    if (match?.[0]) {
      const dateStr = match[0].trim();
      const now = new Date();
      let parsed;
      try { parsed = new Date(dateStr); } catch { parsed = null; }
      const status = parsed && !isNaN(parsed)
        ? (parsed < now ? 'closed' : parsed - now < 7 * 86400000 ? 'closing-soon' : 'open')
        : 'open';
      dates.push({ event: label, date: dateStr, status });
    }
  }

  // Remove duplicates by label
  const seen = new Set();
  return dates.filter(d => { if (seen.has(d.event)) return false; seen.add(d.event); return true; });
}

function extractVacancyTable(text) {
  const table = [];
  const categoryMap = {
    'UR|GEN|GENERAL|OPEN': 'General / UR',
    'OBC': 'OBC',
    'EWS': 'EWS',
    'SC': 'SC',
    'ST': 'ST',
    'EBC': 'EBC',
    'BC': 'BC',
    'PH|PWD|DIVYANG': 'PH / PWD',
    'FEMALE|WOMEN': 'Female',
    'EX.?SERVICE|EX-SERVICE': 'Ex-Servicemen',
  };

  for (const [pattern, label] of Object.entries(categoryMap)) {
    const regex = new RegExp(`(?:${pattern})[\\s:–-]*([0-9,]+)`, 'i');
    const m = text.match(regex);
    if (m?.[1]) {
      const n = m[1].replace(/,/g, '');
      if (parseInt(n) > 0) {
        table.push({ category: label, vacancies: n });
      }
    }
  }

  // Also try to find total
  const total = extractTotalVacancies(text);
  if (total && !table.find(t => t.category === 'Total')) {
    table.push({ category: 'Total Posts', vacancies: total });
  }

  return table;
}

function extractTotalVacancies(text) {
  const patterns = [
    /total.{0,30}?(\d[\d,]+)\s*(?:post|vacancies|vacancy|seat)/i,
    /(\d[\d,]+)\s*(?:total\s+)?(?:post|vacancies|vacancy)/i,
    /no\.?\s*of\s*(?:post|vacancies)[:\s]+(\d[\d,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].replace(/,/g, '');
  }
  return '';
}

function extractEligibility(text) {
  const items = [];
  const patterns = [
    /(?:educational\s+)?qualif\w+[:\s]+([^\n.]{20,200})/gi,
    /(?:minimum\s+)?(?:educational\s+)?(?:qualification|eligibility)[:\s]+([^\n.]{20,200})/gi,
    /(?:degree|diploma|graduation|12th|10th|graduate|post.graduate)[^\n.]{0,150}/gi,
  ];

  for (const p of patterns) {
    let m;
    while ((m = p.exec(text)) !== null && items.length < 5) {
      const item = (m[1] || m[0]).trim().replace(/\s+/g, ' ');
      if (item.length > 15 && !items.includes(item)) items.push(item);
    }
    if (items.length >= 3) break;
  }
  return items.slice(0, 6);
}

function extractFeeTable(text) {
  const table = [];
  const feePatterns = [
    { cat: 'General / OBC / EWS', regex: /(?:gen(?:eral)?|obc|ews)[^₹\d]*(?:Rs\.?|₹)\s*(\d[\d,]*)/i },
    { cat: 'SC / ST / PH / Female', regex: /(?:sc|st|ph|pwd|female|women)[^₹\d]*(?:Rs\.?|₹)\s*(\d[\d,]*)/i },
    { cat: 'All Categories', regex: /(?:application fee|fees)[^₹\d]*(?:Rs\.?|₹)\s*(\d[\d,]*)/i },
  ];

  for (const { cat, regex } of feePatterns) {
    const m = text.match(regex);
    if (m?.[1]) table.push({ category: cat, fee: `₹${m[1]}` });
  }

  const noFee = /no\s*(?:application\s*)?fee|free\s*of\s*cost|nil/i.test(text);
  if (!table.length && noFee) table.push({ category: 'All Candidates', fee: 'No Fee / Nil' });

  return table;
}

function extractFeeSimple(text) {
  const m = text.match(/(?:application fee|fees)[^₹\d\n]{0,30}(?:Rs\.?|₹)\s*(\d[\d,]*)/i);
  if (m?.[1]) return `₹${m[1]}`;
  if (/no\s*fee|nil|free/i.test(text)) return 'No Fee';
  return '';
}

function extractSelectionProcess(text) {
  const steps = [];
  const commonSteps = [
    ['prelim|preliminary|pre\\.?\\s*exam', 'Preliminary Examination'],
    ['main|mains', 'Mains Examination'],
    ['written|written\\s+test|cbt|computer\\s+based', 'Written Examination'],
    ['interview|viva|oral\\s+test|personality\\s+test', 'Interview / Personality Test'],
    ['physical|pet|pst|medical', 'Physical / Medical Test'],
    ['skill\\s+test|trade\\s+test|typing|shorthand', 'Skill / Trade Test'],
    ['document\\s+verif', 'Document Verification'],
    ['merit\\s+list|final\\s+merit', 'Final Merit List'],
  ];

  for (const [pattern, label] of commonSteps) {
    if (new RegExp(pattern, 'i').test(text)) steps.push(label);
  }
  return steps.length ? steps : ['Written Examination', 'Document Verification'];
}

function extractHowToApply(text) {
  const generic = [
    'Visit the official website link given below',
    'Click on the recruitment notification',
    'Read the official notification carefully before applying',
    'Check your eligibility (age, qualification, category)',
    'Click on "Apply Online" link',
    'Register with your email ID and mobile number',
    'Fill in all personal and educational details carefully',
    'Upload scanned photograph, signature and required documents',
    'Pay the application fee online (if applicable)',
    'Submit the form and take printout of confirmation page',
  ];

  // Try to find specific steps from the text
  const stepMatch = text.match(/how\s+to\s+(?:apply|fill)[\s\S]{0,500}/i);
  if (stepMatch) {
    const block = stepMatch[0];
    const numbered = block.match(/\d\.\s+([^\n.]{20,120})/g);
    if (numbered?.length > 3) {
      return numbered.slice(0, 10).map(s => s.replace(/^\d\.\s+/, '').trim());
    }
  }
  return generic;
}

function extractSalary(text) {
  const m = text.match(/(?:pay\s*(?:scale|level|band|matrix)|salary|ctc)[:\s]+([^\n]{5,80})/i)
    || text.match(/(?:Rs\.?|₹)\s*([\d,]+(?:\s*[-–]\s*[\d,]+)?(?:\s*p\.?m\.?)?)/);
  if (!m) return '';
  const raw = m[0].includes('₹') || m[0].includes('Rs') ? m[0] : `₹${m[1]}`;
  return raw.replace(/\s+/g, ' ').trim().slice(0, 80);
}

function extractQualification(text) {
  const m = text.match(/(?:educational\s+)?qualif\w+[:\s]+([^\n.]{15,150})/i)
    || text.match(/(?:b\.?tech|b\.?e\.|graduation|degree|diploma|graduate|12th pass|10th pass)[^\n.]{0,100}/i);
  return m ? m[0].trim().slice(0, 120) : '';
}

function extractAgeLimit(text) {
  const m = text.match(/(?:age\s*limit|minimum\s+age|maximum\s+age)[:\s]*([^\n.]{5,60})/i)
    || text.match(/(\d{2})\s*(?:to|[-–])\s*(\d{2})\s*years?/i);
  return m ? m[0].trim().slice(0, 60) : '';
}
