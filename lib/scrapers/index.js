// lib/scrapers/index.js (v4)
import { dedupe, sortJobs, safe, CACHE_SECONDS } from './utils.js';
import { isOfficialLink, getOfficialDomain } from './domain-filter.js';
import { upsertJobs } from '../db/supabase.js';

// Central portals (Employment News removed)
import { fetchNCS, fetchUPSC, fetchSSC, fetchIBPS, fetchSBI, fetchRBI, fetchIndiaPostGDS, fetchArmy, fetchNavy, fetchDRDO, fetchISRO, fetchFCI, fetchKVS, fetchESIC } from './central.js';

// Bihar & UP belt (BiharPower, UPSESSB, UPBEB, NHM UP, UPPCL removed)
import { fetchBPSC, fetchBSSC, fetchBPSSC, fetchBTSC, fetchNHMBihar, fetchAIIMSPatna, fetchUPPSC, fetchUPSSC, fetchUPPolice, fetchAIIMSGorakhpur, fetchAIIMSRaebareli, fetchJPSC, fetchJSSC } from './bihar-up.js';

// Odisha (NHM Odisha removed)
import { fetchOPSC, fetchOSSC, fetchOSSSC, fetchOdishaPolice, fetchOrissaHC, fetchAIIMSBhubaneswar } from './odisha.js';

import { fetchMPPSC, fetchMPESB, fetchMPPolice, fetchRPSC, fetchRSSB, fetchHPSC, fetchHSSC, fetchPPSC, fetchPSSSB, fetchWBPSC, fetchTNPSC, fetchKPSC, fetchKPSCKarnataka, fetchMPSC, fetchTSPSC, fetchAPPSC, fetchGPSC, fetchOJAS, fetchHPPSC, fetchUKPSC, fetchUKSSC, fetchAPSC, fetchDSSSB } from './other-states.js';

export { CACHE_SECONDS };
export const CATEGORIES = ['All','UPSC','SSC','Banking','Railways','Defence','State PSC','Teaching','PSU','Health','Judiciary','Central Government'];

function toDBJob(job) {
  return {
    id: job.id, title: job.title || '', title_hi: job.title_hi || null,
    organization: job.organization || '', category: job.category || 'Central Government',
    state: job.state || 'Central', source: job.source || '',
    source_url: isOfficialLink(job.sourceUrl) ? job.sourceUrl : '',
    section: job.section || 'jobs', badge: job.badge || 'Official',
    apply_link: isOfficialLink(job.link) ? job.link : '',
    notification_pdf: job.notification_pdf || '',
    official_domain: getOfficialDomain(job.link || job.sourceUrl || ''),
    last_date: job.lastDate || job.last_date || '',
    vacancies: job.vacancies || '', salary: job.salary || '',
    qualification: job.qualification || '',
    age_limit: job.ageLimit || job.age_limit || '',
    application_fee: job.applicationFee || job.application_fee || '',
    selection_process: job.selectionProcess || '',
    apply_mode: job.applyMode || 'Online', description: job.description || '',
    important_dates: job.important_dates || [], vacancy_table: job.vacancy_table || [],
    eligibility_list: job.eligibility_list || [], fee_table: job.fee_table || [],
    selection_steps: job.selection_steps || [], how_to_apply: job.how_to_apply || [],
    official_links: job.official_links || [],
    pub_date: job.pubDate ? new Date(job.pubDate).toISOString() : null,
    pdf_parsed: job.pdf_parsed || false, manually_edited: false, is_active: true,
  };
}

const P1 = [
  ['NCS Portal',      fetchNCS],
  ['UPSC',            fetchUPSC],
  ['SSC',             fetchSSC],
  ['IBPS',            fetchIBPS],
  ['SBI',             fetchSBI],
  ['RBI',             fetchRBI],
  ['India Post GDS',  fetchIndiaPostGDS],
  ['Indian Army',     fetchArmy],
  ['FCI',             fetchFCI],
];

const P2 = [
  ['BPSC',              fetchBPSC],
  ['BSSC',              fetchBSSC],
  ['Bihar Police',      fetchBPSSC],
  ['BTSC Bihar',        fetchBTSC],
  ['NHM Bihar',         fetchNHMBihar],
  ['AIIMS Patna',       fetchAIIMSPatna],
  ['UPPSC',             fetchUPPSC],
  ['UPSSSC',            fetchUPSSC],
  ['UP Police',         fetchUPPolice],
  ['AIIMS Gorakhpur',   fetchAIIMSGorakhpur],
  ['AIIMS Raebareli',   fetchAIIMSRaebareli],
  ['OPSC',              fetchOPSC],
  ['OSSC',              fetchOSSC],
  ['OSSSC',             fetchOSSSC],
  ['Odisha Police',     fetchOdishaPolice],
  ['Orissa HC',         fetchOrissaHC],
  ['AIIMS Bhubaneswar', fetchAIIMSBhubaneswar],
];

const P3 = [
  ['Indian Navy',    fetchNavy],
  ['DRDO',           fetchDRDO],
  ['ISRO',           fetchISRO],
  ['KVS',            fetchKVS],
  ['ESIC',           fetchESIC],
  ['JPSC',           fetchJPSC],
  ['JSSC',           fetchJSSC],
  ['MPPSC',          fetchMPPSC],
  ['MPESB',          fetchMPESB],
  ['MP Police',      fetchMPPolice],
  ['RPSC',           fetchRPSC],
  ['RSSB',           fetchRSSB],
  ['HPSC',           fetchHPSC],
  ['HSSC',           fetchHSSC],
  ['PPSC',           fetchPPSC],
  ['PSSSB',          fetchPSSSB],
  ['WBPSC',          fetchWBPSC],
  ['TNPSC',          fetchTNPSC],
  ['KPSC Kerala',    fetchKPSC],
  ['KPSC Karnataka', fetchKPSCKarnataka],
  ['MPSC',           fetchMPSC],
  ['TSPSC',          fetchTSPSC],
  ['APPSC',          fetchAPPSC],
  ['GPSC',           fetchGPSC],
  ['OJAS',           fetchOJAS],
  ['HPPSC',          fetchHPPSC],
  ['UKPSC',          fetchUKPSC],
  ['UKSSSC',         fetchUKSSC],
  ['APSC',           fetchAPSC],
  ['DSSSB',          fetchDSSSB],
];

async function runBatch(scrapers) {
  const results = await Promise.allSettled(scrapers.map(([name, fn]) => safe(name, fn)));
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

export async function fetchAllJobs() {
  const [p1, p23] = await Promise.all([runBatch(P1), Promise.all([runBatch(P2), runBatch(P3)]).then(([a,b]) => [...a,...b])]);
  const raw = sortJobs(dedupe([...p1, ...p23]));
  const official = raw.filter(j => isOfficialLink(j.link || j.sourceUrl || ''));
  upsertJobs(official.map(toDBJob)).catch(e => console.error('[Sync]', e.message));
  return official;
}

export async function fetchJobsBySection(section) {
  const all = await fetchAllJobs();
  if (!section || section === 'all') return all;
  return all.filter(j => j.section === section);
}
