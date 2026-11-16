"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { imageExtension, photoMaxBytes } from "@/lib/validation";

export async function uploadPublicPhoto(
  file: File,
  bucket: "cook-photos" | "dish-photos",
) {
  const extension = imageExtension(file.type);

  if (!extension || file.size > photoMaxBytes) {
    throw new Error("Use a JPEG, PNG, or WebP photo under 5 MB.");
  }

  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (error || typeof userId !== "string") {
    throw new Error("Sign in again to upload a photo.");
  }

  const path = `${userId}/${crypto.randomUUID()}/photo.${extension}`;
  const uploaded = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploaded.error) {
    throw new Error("Could not upload that photo. Try again.");
  }

  return path;
}
