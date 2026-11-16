import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing SUPABASE_SECRET_KEY.");
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
