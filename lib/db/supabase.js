// lib/db/supabase.js
// Supabase client — free tier safe
// Storage: ~1MB / 500MB limit
// API calls: ~700/month / 50,000 limit

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing env vars — running without database');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ── Upsert a job (insert or update) ──────────────────────────────────────────
export async function upsertJob(job) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('jobs')
      .upsert(job, { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[DB upsertJob]', e.message);
    return null;
  }
}

// ── Bulk upsert (batches of 50 to stay within free tier limits) ──────────────
export async function upsertJobs(jobs) {
  if (!supabase || !jobs.length) return;
  const BATCH = 50;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);
    try {
      const { error } = await supabase
        .from('jobs')
        .upsert(batch, { onConflict: 'id' });
      if (error) throw error;
    } catch (e) {
      console.error(`[DB upsertJobs batch ${i}]`, e.message);
    }
  }
}

// ── Fetch jobs with filters ───────────────────────────────────────────────────
export async function fetchJobs({ section, category, search, page = 1, limit = 20 }) {
  if (!supabase) return { jobs: [], total: 0 };
  try {
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (section && section !== 'all') query = query.eq('section', section);
    if (category && category !== 'All') query = query.eq('category', category);
    if (search?.trim()) {
      query = query.or(
        `title.ilike.%${search}%,organization.ilike.%${search}%,state.ilike.%${search}%`
      );
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { jobs: data || [], total: count || 0 };
  } catch (e) {
    console.error('[DB fetchJobs]', e.message);
    return { jobs: [], total: 0 };
  }
}

// ── Fetch single job by id ────────────────────────────────────────────────────
export async function fetchJobById(id) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('[DB fetchJobById]', e.message);
    return null;
  }
}

// ── Fetch section counts for tab badges ──────────────────────────────────────
export async function fetchSectionCounts() {
  if (!supabase) return {};
  try {
    const sections = ['jobs', 'admitcards', 'results', 'answerkeys'];
    const counts = {};
    await Promise.all(sections.map(async (sec) => {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('section', sec)
        .eq('is_active', true);
      counts[sec] = count || 0;
    }));
    return counts;
  } catch (e) {
    console.error('[DB fetchSectionCounts]', e.message);
    return {};
  }
}

// ── Admin: update a job field manually ───────────────────────────────────────
export async function adminUpdateJob(id, fields) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ ...fields, manually_edited: true })
      .eq('id', id);
    if (error) throw error;

    // Log each field change in admin_edits table
    await Promise.all(
      Object.entries(fields).map(([field, value]) =>
        supabase.from('admin_edits').insert({
          job_id: id,
          field_name: field,
          field_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        })
      )
    );
    return true;
  } catch (e) {
    console.error('[DB adminUpdateJob]', e.message);
    return null;
  }
}

// ── Admin: list all jobs (for admin panel) ────────────────────────────────────
export async function adminListJobs({ page = 1, limit = 50, search = '' }) {
  if (!supabase) return { jobs: [], total: 0 };
  try {
    let query = supabase
      .from('jobs')
      .select('id,title,organization,category,section,last_date,vacancies,pdf_parsed,manually_edited,updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { jobs: data || [], total: count || 0 };
  } catch (e) {
    console.error('[DB adminListJobs]', e.message);
    return { jobs: [], total: 0 };
  }
}
