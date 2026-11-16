"use server";

import { refresh } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const applicationIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReviewState = {
  message?: string;
};

export async function reviewApplication(
  _state: ReviewState | null,
  formData: FormData,
): Promise<ReviewState> {
  const result = await requireRole("admin");

  if (result.status !== "ok") {
    return { message: "We could not find your profile." };
  }

  const decision = formData.get("decision");
  const applicationId = formData.get("applicationId");

  if (decision !== "approved" && decision !== "rejected") {
    return { message: "Could not update this application. Try again." };
  }

  if (typeof applicationId !== "string" || !applicationIdPattern.test(applicationId)) {
    return { message: "This application is no longer waiting for review." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("review_cook_application", {
    application_id: applicationId,
    decision,
    admin_id: result.profile.id,
  });

  if (error) {
    if (error.message.includes("not pending")) {
      return { message: "This application is no longer waiting for review." };
    }

    return { message: "Could not update this application. Try again." };
  }

  refresh();
  return {};
}
