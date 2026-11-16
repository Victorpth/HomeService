import "server-only";

import { cache } from "react";

import { getProfile } from "@/lib/auth";
import { isApplicationStatus, statusLabel } from "@/lib/cook-application";
import { createClient } from "@/lib/supabase/server";

export type AccountLink = {
  href: string;
  label: string;
};

export const getAccountLinks = cache(async (): Promise<AccountLink[]> => {
  const profile = await getProfile();

  if (!profile) {
    return [
      { href: "/signup", label: "Sign up" },
      { href: "/login", label: "Log in" },
    ];
  }

  if (profile.role === "host") {
    return [
      { href: "/host", label: "My page" },
      { href: "/apply", label: await hostApplicationLabel(profile.id) },
    ];
  }

  if (profile.role === "cook") {
    return [{ href: "/cook", label: "My page" }];
  }

  return [{ href: "/admin", label: "Admin" }];
});

async function hostApplicationLabel(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cook_applications")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = data?.status;

  if (error || !isApplicationStatus(status)) {
    return "Become a cook";
  }

  return statusLabel(status);
}
