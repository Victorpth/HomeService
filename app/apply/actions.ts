"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getLiveAccount, roleHome } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  validateApplication,
  type ApplicationFieldErrors,
} from "@/lib/validation";

export type ApplyState = {
  message?: string;
  fieldErrors?: ApplicationFieldErrors;
};

const photoBucket = "cook-photos";
const cvBucket = "cook-cvs";

async function removeUploaded(files: { bucket: string; path: string }[]) {
  if (files.length === 0) {
    return;
  }

  try {
    const admin = createAdminClient();
    for (const bucket of [photoBucket, cvBucket]) {
      const paths = files
        .filter((file) => file.bucket === bucket)
        .map((file) => file.path);
      if (paths.length > 0) {
        await admin.storage.from(bucket).remove(paths);
      }
    }
  } catch {
    return;
  }
}

export async function applyToCook(
  _state: ApplyState | null,
  formData: FormData,
): Promise<ApplyState> {
  const account = await getLiveAccount();

  if (account.status === "anonymous") {
    redirect("/login");
  }

  if (account.status === "missing") {
    return { message: "We could not find your profile." };
  }

  if (account.profile.role !== "host") {
    redirect(roleHome(account.profile.role));
  }

  const validated = await validateApplication(formData);
  if (!validated.application || Object.keys(validated.fieldErrors).length > 0) {
    return { fieldErrors: validated.fieldErrors };
  }

  const supabase = await createClient();
  const { data: pending, error: pendingError } = await supabase
    .from("cook_applications")
    .select("id")
    .eq("user_id", account.profile.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    return { message: "Could not send your application. Try again." };
  }

  if (pending) {
    return { message: "You already have an application waiting for review." };
  }

  const application = validated.application;
  const applicationId = crypto.randomUUID();
  const uploaded: { bucket: string; path: string }[] = [];
  const photoPaths: string[] = [];

  for (const [index, photo] of application.photos.entries()) {
    const path = `${account.profile.id}/${applicationId}/${index + 1}.${photo.extension}`;
    const { error } = await supabase.storage.from(photoBucket).upload(path, photo.file, {
      contentType: photo.contentType,
      upsert: false,
    });

    if (error) {
      await removeUploaded(uploaded);
      return { message: "Could not upload your photos. Try again." };
    }

    uploaded.push({ bucket: photoBucket, path });
    photoPaths.push(path);
  }

  const cvPath = `${account.profile.id}/${applicationId}/cv.${application.cv.extension}`;
  const { error: cvError } = await supabase.storage
    .from(cvBucket)
    .upload(cvPath, application.cv.file, {
      contentType: application.cv.contentType,
      upsert: false,
    });

  if (cvError) {
    await removeUploaded(uploaded);
    return { message: "Could not upload your CV. Try again." };
  }

  uploaded.push({ bucket: cvBucket, path: cvPath });

  const { error: insertError } = await supabase.from("cook_applications").insert({
    id: applicationId,
    user_id: account.profile.id,
    bio: application.bio,
    specialties: application.specialties,
    cuisine_origin: application.cuisineOrigin,
    zone: application.zone,
    base_price_eur: application.basePriceEur,
    photo_paths: photoPaths,
    cv_path: cvPath,
    status: "pending",
  });

  if (insertError) {
    await removeUploaded(uploaded);

    if (insertError.code === "23505") {
      return { message: "You already have an application waiting for review." };
    }

    return { message: "Could not send your application. Try again." };
  }

  refresh();
  return {};
}
