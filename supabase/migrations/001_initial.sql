-- Run this in the Supabase SQL editor or via: supabase db push

CREATE TABLE IF NOT EXISTS quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Input
  description     TEXT NOT NULL,
  region          TEXT,
  hourly_rate     INT,

  -- AI output
  ai_response     JSONB NOT NULL,
  confidence      TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  quote_number    TEXT NOT NULL UNIQUE,

  -- Customer (optional, filled in later)
  customer_name   TEXT,
  customer_email  TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'rejected'))
);

-- Fast lookup for history page
CREATE INDEX quotes_created_at_idx ON quotes (created_at DESC);

-- Enable Row Level Security (lock down before adding auth)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Temporary open policy for development — replace with auth-scoped policy before launch
CREATE POLICY "allow_all_for_now" ON quotes FOR ALL USING (true) WITH CHECK (true);
