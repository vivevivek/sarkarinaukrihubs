-- ============================================================
-- SarkariNaukriHubs — Supabase Schema
-- Run this ONCE in your Supabase project → SQL Editor
-- Free tier: 500MB database, 50,000 API calls/month
-- Our usage: ~1MB storage, ~700 API calls/month
-- ============================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS admin_edits CASCADE;

-- ─── MAIN JOBS TABLE ────────────────────────────────────────
CREATE TABLE jobs (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  title_hi            TEXT,                    -- Hindi title
  organization        TEXT DEFAULT '',
  category            TEXT DEFAULT 'Central Government',
  state               TEXT DEFAULT 'Central',
  source              TEXT DEFAULT '',
  source_url          TEXT DEFAULT '',
  section             TEXT DEFAULT 'jobs',     -- jobs/admitcards/results/answerkeys
  badge               TEXT DEFAULT 'Official',

  -- Application links (ONLY official .gov.in domains)
  apply_link          TEXT DEFAULT '',
  notification_pdf    TEXT DEFAULT '',         -- Direct PDF URL
  official_domain     TEXT DEFAULT '',         -- e.g. bpsc.bih.nic.in

  -- Quick-display fields
  last_date           TEXT DEFAULT '',
  vacancies           TEXT DEFAULT '',
  salary              TEXT DEFAULT '',
  qualification       TEXT DEFAULT '',
  age_limit           TEXT DEFAULT '',
  application_fee     TEXT DEFAULT '',
  selection_process   TEXT DEFAULT '',
  apply_mode          TEXT DEFAULT 'Online',
  description         TEXT DEFAULT '',

  -- Rich extracted data from PDF (JSONB for flexibility)
  important_dates     JSONB DEFAULT '[]',
  -- Format: [{"event": "Apply Start", "date": "07 May 2026", "status": "open"},...]

  vacancy_table       JSONB DEFAULT '[]',
  -- Format: [{"category": "General/UR", "vacancies": "513"},...]

  eligibility_list    JSONB DEFAULT '[]',
  -- Format: [{"post": "CCE", "criteria": "Graduation from recognised university"},...]

  fee_table           JSONB DEFAULT '[]',
  -- Format: [{"category": "General/OBC/EWS", "fee": "₹100"},...]

  selection_steps     JSONB DEFAULT '[]',
  -- Format: ["Preliminary Exam", "Mains Exam", "Interview", "Document Verification"]

  how_to_apply        JSONB DEFAULT '[]',
  -- Format: ["Visit official website", "Click Apply Online", ...]

  official_links      JSONB DEFAULT '[]',
  -- Format: [{"label": "Apply Online", "url": "https://..."},...]

  -- Metadata
  pub_date            TIMESTAMPTZ,
  scraped_at          TIMESTAMPTZ DEFAULT NOW(),
  pdf_parsed          BOOLEAN DEFAULT FALSE,
  manually_edited     BOOLEAN DEFAULT FALSE,   -- Set true when admin edits
  is_active           BOOLEAN DEFAULT TRUE,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADMIN EDITS TABLE ──────────────────────────────────────
-- Stores manual overrides — never overwritten by scrapers
CREATE TABLE admin_edits (
  id            SERIAL PRIMARY KEY,
  job_id        TEXT REFERENCES jobs(id) ON DELETE CASCADE,
  field_name    TEXT NOT NULL,      -- e.g. "vacancy_table", "important_dates"
  field_value   TEXT NOT NULL,      -- JSON string
  edited_at     TIMESTAMPTZ DEFAULT NOW(),
  note          TEXT DEFAULT ''     -- optional admin note
);

-- ─── INDEXES for fast queries ────────────────────────────────
CREATE INDEX idx_jobs_category   ON jobs(category);
CREATE INDEX idx_jobs_section    ON jobs(section);
CREATE INDEX idx_jobs_state      ON jobs(state);
CREATE INDEX idx_jobs_is_active  ON jobs(is_active);
CREATE INDEX idx_jobs_updated_at ON jobs(updated_at DESC);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- Allow public read (for the website to fetch jobs)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow service insert/update" ON jobs FOR ALL USING (true);

ALTER TABLE admin_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service all" ON admin_edits FOR ALL USING (true);

-- ─── AUTO UPDATE updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done! Your schema is ready.
-- Next: copy your Supabase URL and anon key to .env.local
