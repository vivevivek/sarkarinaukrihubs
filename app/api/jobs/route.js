// ─────────────────────────────────────────────────────────────────────────────
// app/api/jobs/route.js
// ─────────────────────────────────────────────────────────────────────────────

import { fetchAllJobs, CATEGORIES, CACHE_SECONDS } from '../../../lib/scrapers/index.js';

export const revalidate = CACHE_SECONDS; // inherits from utils.js (default 21600 = 6 hrs)

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const section  = searchParams.get('section')  || 'jobs';
  const search   = searchParams.get('search')   || '';
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit    = 20;

  try {
    let jobs = await fetchAllJobs();

    if (section && section !== 'all') {
      jobs = jobs.filter(j => j.section === section);
    }
    if (category !== 'All') {
      jobs = jobs.filter(j => j.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.organization?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.state?.toLowerCase().includes(q)
      );
    }

    // Section counts for tab badges
    const all = await fetchAllJobs();
    const counts = {
      jobs:       all.filter(j => j.section === 'jobs').length,
      admitcards: all.filter(j => j.section === 'admitcards').length,
      results:    all.filter(j => j.section === 'results').length,
      answerkeys: all.filter(j => j.section === 'answerkeys').length,
    };

    const total     = jobs.length;
    const pages     = Math.max(1, Math.ceil(total / limit));
    const paginated = jobs.slice((page - 1) * limit, page * limit);

    return Response.json(
      { jobs: paginated, total, page, pages, categories: CATEGORIES, counts,
        refreshedAt: new Date().toISOString(),
        nextRefreshIn: `${CACHE_SECONDS / 3600} hours` },
      { headers: { 'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}` } }
    );
  } catch (err) {
    console.error('[/api/jobs]', err);
    return Response.json({ error: 'Failed to fetch jobs', jobs: [], total: 0 }, { status: 500 });
  }
}
