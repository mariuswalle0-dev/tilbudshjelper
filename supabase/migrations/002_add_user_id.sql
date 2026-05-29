-- Add Clerk user_id to scope quotes per user

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Index for per-user history queries
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes (user_id, created_at DESC);

-- Drop the open dev policy and replace with user-scoped one
DROP POLICY IF EXISTS "allow_all_for_now" ON quotes;

-- API routes use the service role key (bypasses RLS), so this policy
-- protects direct Supabase client access (e.g., future mobile app).
CREATE POLICY "users_own_quotes" ON quotes
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
