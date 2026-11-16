import "server-only";

import { isStoragePath } from "@/lib/cook-application";
import { createClient } from "@/lib/supabase/server";

const cvUrlLifetimeSeconds = 300;

export async function signCvUrl(path: string) {
  if (!isStoragePath(path)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("cook-cvs")
    .createSignedUrl(path, cvUrlLifetimeSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
