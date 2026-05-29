import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (browser) — uses anon key, respects RLS
export const supabase = createClient(url, anonKey);

// Server-side (API routes) — bypasses RLS for trusted writes
export const supabaseAdmin = () => createClient(url, serviceKey);
