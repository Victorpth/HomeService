"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

export function createBrowserSupabase() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
