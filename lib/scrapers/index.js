// ─────────────────────────────────────────────────────────────────────────────
// lib/scrapers/index.js
// Master orchestrator. Runs all scrapers in priority batches,
// deduplicates, sorts, and exports fetchAllJobs().
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  REFRESH RATE GUIDE  –  set CACHE_SECONDS in utils.js                  │
// ├──────────────────────────┬─────────────────────────┬───────────────────┤
// │  Platform                │ Free Tier Limit          │ Recommended       │
// ├──────────────────────────┼─────────────────────────┼───────────────────┤
// │  Vercel Hobby (free)     │ 100 GB BW, 6h cron min  │ 21600s  (6 hrs)   │
// │  Render Free             │ 750 hrs/mo, sleeps idle  │ 21600s  (6 hrs)   │
// │  Railway Free            │ 500 hrs/mo               │ 21600s  (6 hrs)   │
// │  Netlify Free            │ 125k fn invocations/mo   │ 21600s  (6 hrs)   │
// │  Vercel Pro  ($20/mo)    │ 1 TB BW, 1h cron min    │ 7200s   (2 hrs)   │
// │  Railway Starter ($5/mo) │ Always-on                │ 7200s   (2 hrs)   │
// │  DigitalOcean $6 VPS     │ Always-on, full control  │ 3600s   (1 hr)    │
// └──────────────────────────┴─────────────────────────┴───────────────────┘
//
//  WHY 6 HOURS IS PERFECTLY FINE:
//  Govt job notifications are posted 1-3 times per WEEK per portal.
//  6-hour refresh = never more than 6 hrs behind = more than fresh enough.
//  Shorter intervals waste free-tier quota with zero benefit.
// ─────────────────────────────────────────────────────────────────────────────

import { dedupe, sortJobs, safe, CACHE_SECONDS } from './utils.js';

// Central government portals
import {
  fetchEmploymentNews, fetchNCS, fetchUPSC, fetchSSC,
  fetchIBPS, fetchSBI, fetchRBI, fetchIndiaPostGDS,
  fetchArmy, fetchNavy, fetchDRDO, fetchISRO, fetchFCI,
  fetchKVS, fetchESIC,
} from './central.js';

// Bihar & UP belt portals
import {
  fetchBPSC, fetchBSSC, fetchBPSSC, fetchBTSC,
  fetchNHMBihar, fetchAIIMSPatna, fetchBiharPower,
  fetchUPPSC, fetchUPSSC, fetchUPPolice,
  fetchUPSESSB, fetchUPBEB, fetchNHMUP, fetchUPPCL,
  fetchAIIMSGorakhpur, fetchAIIMSRaebareli,
  fetchJPSC, fetchJSSC,
} from './bihar-up.js';

// Odisha state portals
import {
  fetchOPSC, fetchOSSC, fetchOSSSC, fetchOdishaPolice,
  fetchNHMOdisha, fetchOrissaHC, fetchAIIMSBhubaneswar,
} from './odisha.js';

// Other state PSC portals
import {
  fetchMPPSC, fetchMPESB, fetchMPPolice,
  fetchRPSC, fetchRSSB,
  fetchHPSC, fetchHSSC,
  fetchPPSC, fetchPSSSB,
  fetchWBPSC, fetchTNPSC, fetchKPSC,
  fetchKPSCKarnataka, fetchMPSC, fetchTSPSC,
  fetchAPPSC, fetchGPSC, fetchOJAS,
  fetchHPPSC, fetchUKPSC, fetchUKSSC,
  fetchAPSC, fetchDSSSB,
} from './other-states.js';

export { CACHE_SECONDS };

export const CATEGORIES = [
  'All', 'UPSC', 'SSC', 'Banking', 'Railways', 'Defence',
  'State PSC', 'Teaching', 'PSU', 'Health', 'Judiciary',
  'Central Government',
];

export const PORTALS = [
  { name: 'UPSC',            url: 'https://www.upsc.gov.in',                logo: '🏛️', category: 'UPSC' },
  { name: 'SSC',             url: 'https://ssc.gov.in',                     logo: '📋', category: 'SSC' },
  { name: 'IBPS',            url: 'https://www.ibps.in',                    logo: '🏦', category: 'Banking' },
  { name: 'SBI Careers',     url: 'https://sbi.co.in/web/careers',          logo: '💰', category: 'Banking' },
  { name: 'RBI',             url: 'https://opportunities.rbi.org.in',       logo: '🏦', category: 'Banking' },
  { name: 'India Post GDS',  url: 'https://indiapostgdsonline.gov.in',       logo: '📬', category: 'Central Government' },
  { name: 'Employment News', url: 'https://www.employmentnews.gov.in',       logo: '📰', category: 'Central Government' },
  { name: 'NCS Portal',      url: 'https://www.ncs.gov.in',                 logo: '🌐', category: 'Central Government' },
  { name: 'Indian Army',     url: 'https://joinindianarmy.nic.in',           logo: '⭐', category: 'Defence' },
  { name: 'Indian Navy',     url: 'https://www.joinindiannavy.gov.in',       logo: '⚓', category: 'Defence' },
  { name: 'DRDO',            url: 'https://www.drdo.gov.in/careers',         logo: '🔬', category: 'PSU' },
  { name: 'ISRO',            url: 'https://www.isro.gov.in/Careers.html',    logo: '🚀', category: 'PSU' },
  { name: 'BPSC',            url: 'https://www.bpsc.bih.nic.in',            logo: '📄', category: 'State PSC' },
  { name: 'UPPSC',           url: 'https://uppsc.up.nic.in',                logo: '📄', category: 'State PSC' },
  { name: 'UPSSSC',          url: 'https://upsssc.gov.in',                  logo: '📄', category: 'State PSC' },
  { name: 'UP Police',       url: 'https://uppbpb.gov.in',                  logo: '👮', category: 'Defence' },
  { name: 'Bihar Police',    url: 'https://bpssc.bih.nic.in',               logo: '👮', category: 'Defence' },
  { name: 'OPSC',            url: 'https://www.opsc.gov.in',                logo: '🏅', category: 'State PSC' },
  { name: 'OSSSC',           url: 'https://www.osssc.gov.in',               logo: '📄', category: 'State PSC' },
  { name: 'FCI',             url: 'https://fci.gov.in/recruitments.php',    logo: '🌾', category: 'Central Government' },
  { name: 'KVS',             url: 'https://kvsangathan.nic.in',             logo: '🏫', category: 'Teaching' },
  { name: 'ESIC',            url: 'https://esic.nic.in/recruitment',        logo: '🏥', category: 'Health' },
];

// ── Priority batches ──────────────────────────────────────────────────────────
// P1: RSS/API + highest-traffic national portals  (fast, always run)
// P2: Bihar/UP belt + Odisha                      (high regional demand)
// P3: All other state PSCs                        (broad coverage)

const P1 = [
  ['Employment News', fetchEmploymentNews],
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
  // Bihar belt
  ['BPSC',              fetchBPSC],
  ['BSSC',              fetchBSSC],
  ['Bihar Police',      fetchBPSSC],
  ['BTSC Bihar',        fetchBTSC],
  ['NHM Bihar',         fetchNHMBihar],
  ['AIIMS Patna',       fetchAIIMSPatna],
  ['Bihar Power',       fetchBiharPower],
  // UP belt
  ['UPPSC',             fetchUPPSC],
  ['UPSSSC',            fetchUPSSC],
  ['UP Police',         fetchUPPolice],
  ['UPSESSB',           fetchUPSESSB],
  ['UPBEB',             fetchUPBEB],
  ['NHM UP',            fetchNHMUP],
  ['UPPCL',             fetchUPPCL],
  ['AIIMS Gorakhpur',   fetchAIIMSGorakhpur],
  ['AIIMS Raebareli',   fetchAIIMSRaebareli],
  // Odisha
  ['OPSC',              fetchOPSC],
  ['OSSC',              fetchOSSC],
  ['OSSSC',             fetchOSSSC],
  ['Odisha Police',     fetchOdishaPolice],
  ['NHM Odisha',        fetchNHMOdisha],
  ['Orissa HC',         fetchOrissaHC],
  ['AIIMS Bhubaneswar', fetchAIIMSBhubaneswar],
];

const P3 = [
  // More central
  ['Indian Navy',       fetchNavy],
  ['DRDO',              fetchDRDO],
  ['ISRO',              fetchISRO],
  ['KVS',               fetchKVS],
  ['ESIC',              fetchESIC],
  // Jharkhand
  ['JPSC',              fetchJPSC],
  ['JSSC',              fetchJSSC],
  // Other state PSCs
  ['MPPSC',             fetchMPPSC],
  ['MPESB',             fetchMPESB],
  ['MP Police',         fetchMPPolice],
  ['RPSC',              fetchRPSC],
  ['RSSB',              fetchRSSB],
  ['HPSC',              fetchHPSC],
  ['HSSC',              fetchHSSC],
  ['PPSC',              fetchPPSC],
  ['PSSSB',             fetchPSSSB],
  ['WBPSC',             fetchWBPSC],
  ['TNPSC',             fetchTNPSC],
  ['KPSC Kerala',       fetchKPSC],
  ['KPSC Karnataka',    fetchKPSCKarnataka],
  ['MPSC',              fetchMPSC],
  ['TSPSC',             fetchTSPSC],
  ['APPSC',             fetchAPPSC],
  ['GPSC',              fetchGPSC],
  ['OJAS Gujarat',      fetchOJAS],
  ['HPPSC',             fetchHPPSC],
  ['UKPSC',             fetchUKPSC],
  ['UKSSSC',            fetchUKSSC],
  ['APSC Assam',        fetchAPSC],
  ['DSSSB',             fetchDSSSB],
];

async function runBatch(scrapers) {
  const results = await Promise.allSettled(
    scrapers.map(([name, fn]) => safe(name, fn))
  );
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

export async function fetchAllJobs() {
  const [p1, p23] = await Promise.all([
    runBatch(P1),
    Promise.all([runBatch(P2), runBatch(P3)]).then(([a, b]) => [...a, ...b]),
  ]);
  return sortJobs(dedupe([...p1, ...p23]));
}

export async function fetchJobsBySection(section) {
  const all = await fetchAllJobs();
  if (!section || section === 'all') return all;
  return all.filter(j => j.section === section);
}
