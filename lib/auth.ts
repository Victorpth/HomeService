import "server-only";

import { cacheLife } from "next/cache";
import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const roles = ["host", "cook", "admin"] as const;

export type Role = (typeof roles)[number];

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

export function isRole(value: unknown): value is Role {
  return roles.some((role) => role === value);
}

export function roleHome(role: Role) {
  return `/${role}` as const;
}

type Account =
  | { status: "anonymous" }
  | { status: "missing" }
  | { status: "ok"; profile: Profile };

async function getAccount(): Promise<Account> {
  "use cache: private";
  cacheLife({ stale: 30 });

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims.sub) {
    return { status: "anonymous" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", claimsData.claims.sub)
    .maybeSingle();

  if (
    error ||
    !data ||
    typeof data.id !== "string" ||
    typeof data.email !== "string" ||
    typeof data.full_name !== "string" ||
    !isRole(data.role)
  ) {
    return { status: "missing" };
  }

  return {
    status: "ok",
    profile: {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    },
  };
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const account = await getAccount();
  return account.status === "ok" ? account.profile : null;
});

export async function requireRole(role: Role) {
  const account = await getAccount();

  if (account.status === "anonymous") {
    redirect("/login");
  }

  if (account.status === "missing") {
    return { status: "missing" as const };
  }

  if (account.profile.role !== role) {
    redirect(roleHome(account.profile.role));
  }

  return { status: "ok" as const, profile: account.profile };
}
