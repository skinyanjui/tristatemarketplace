import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The URL and publishable key are designed to be public (row level security protects the data),
// so they ship as defaults and can be overridden with environment variables.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://bfovgafcfetfeqykjfco.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_FfVpTa_cEtn_LRJ5FNc-VQ_8bvPbVZx";

let browser: SupabaseClient | undefined;

/** Browser client with a persisted session. Use only in client components. */
export function supabaseBrowser(): SupabaseClient {
  browser ??= createClient(SUPABASE_URL, SUPABASE_KEY);
  return browser;
}

/** Anonymous server client for public reads. */
export function supabaseServer(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
