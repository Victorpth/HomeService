"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { ownsStoragePath } from "@/lib/cook-application";
import { isUuid, maxDishes } from "@/lib/cook-profile";
import { isStoredImage } from "@/lib/stored-photo";
import { createClient } from "@/lib/supabase/server";
import {
  validateCookProfileFields,
  validateDishFields,
  type CookProfileFieldErrors,
  type DishFieldErrors,
} from "@/lib/validation";

export type ProfileState = {
  message?: string;
  fieldErrors?: CookProfileFieldErrors;
};

export type DishState = {
  message?: string;
  fieldErrors?: DishFieldErrors;
  saved?: boolean;
};

function readPaths(formData: FormData) {
  return formData
    .getAll("photoPath")
    .filter((value): value is string => typeof value === "string");
}

async function requireCook() {
  const result = await requireRole("cook");

  if (result.status !== "ok") {
    return null;
  }

  return result.profile;
}

export async function updateCookProfile(
  _state: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const profile = await requireCook();

  if (!profile) {
    return { message: "We could not find your profile." };
  }

  const validated = validateCookProfileFields(formData);
  const photoPaths = readPaths(formData);
  const fieldErrors = { ...validated.fieldErrors };

  if (photoPaths.length < 1 || photoPaths.length > 3) {
    fieldErrors.photos = "Keep 1 to 3 photos.";
  } else if (photoPaths.some((path) => !ownsStoragePath(path, profile.id))) {
    fieldErrors.photos = "Use photos from your account.";
  }

  if (!validated.profile || Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  for (const path of photoPaths) {
    if (!(await isStoredImage("cook-photos", path, profile.id))) {
      return { fieldErrors: { photos: "Use JPEG, PNG, or WebP photos under 5 MB." } };
    }
  }

  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("cooks")
    .update({
      bio: validated.profile.bio,
      specialties: validated.profile.specialties,
      cuisine_origin: validated.profile.cuisineOrigin,
      zone: validated.profile.zone,
      base_price_eur: validated.profile.basePriceEur,
      photo_paths: photoPaths,
    })
    .eq("id", profile.id)
    .select("id");

  if (error || !saved || saved.length === 0) {
    return { message: "Could not save your profile. Try again." };
  }

  refresh();
  return {};
}

export async function createDish(
  _state: DishState | null,
  formData: FormData,
): Promise<DishState> {
  const profile = await requireCook();

  if (!profile) {
    return { message: "We could not find your profile." };
  }

  const validated = validateDishFields(formData);
  const photoPath = readPaths(formData)[0];

  if (!validated.dish) {
    return { fieldErrors: validated.fieldErrors };
  }

  if (!photoPath || !ownsStoragePath(photoPath, profile.id)) {
    return { fieldErrors: { ...validated.fieldErrors, photo: "Add a photo." } };
  }

  if (!(await isStoredImage("dish-photos", photoPath, profile.id))) {
    return { fieldErrors: { photo: "Use a JPEG, PNG, or WebP photo under 5 MB." } };
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("cook_id", profile.id);

  if (countError) {
    return { message: "Could not add this dish. Try again." };
  }

  if ((count ?? 0) >= maxDishes) {
    return { message: "You can add up to 40 dishes." };
  }

  const { error } = await supabase.from("dishes").insert({
    cook_id: profile.id,
    name: validated.dish.name,
    photo_path: photoPath,
    price_eur: validated.dish.priceEur,
  });

  if (error) {
    if (error.message.includes("too many dishes")) {
      return { message: "You can add up to 40 dishes." };
    }

    return { message: "Could not add this dish. Try again." };
  }

  refresh();
  return { saved: true };
}

export async function updateDish(
  _state: DishState | null,
  formData: FormData,
): Promise<DishState> {
  const profile = await requireCook();

  if (!profile) {
    return { message: "We could not find your profile." };
  }

  const dishId = formData.get("dishId");
  const validated = validateDishFields(formData);
  const photoPath = readPaths(formData)[0];

  if (typeof dishId !== "string" || !isUuid(dishId)) {
    return { message: "Could not save this dish. Try again." };
  }

  if (!validated.dish) {
    return { fieldErrors: validated.fieldErrors };
  }

  if (!photoPath || !ownsStoragePath(photoPath, profile.id)) {
    return { fieldErrors: { ...validated.fieldErrors, photo: "Add a photo." } };
  }

  if (!(await isStoredImage("dish-photos", photoPath, profile.id))) {
    return { fieldErrors: { photo: "Use a JPEG, PNG, or WebP photo under 5 MB." } };
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("dishes")
    .select("photo_path")
    .eq("id", dishId)
    .eq("cook_id", profile.id)
    .maybeSingle();

  if (existingError || !existing || typeof existing.photo_path !== "string") {
    return { message: "Could not save this dish. Try again." };
  }

  const { data: saved, error } = await supabase
    .from("dishes")
    .update({
      name: validated.dish.name,
      photo_path: photoPath,
      price_eur: validated.dish.priceEur,
    })
    .eq("id", dishId)
    .eq("cook_id", profile.id)
    .select("id");

  if (error || !saved || saved.length === 0) {
    return { message: "Could not save this dish. Try again." };
  }

  if (existing.photo_path !== photoPath) {
    await supabase.storage.from("dish-photos").remove([existing.photo_path]);
  }

  refresh();
  return {};
}

export async function deleteDish(formData: FormData) {
  const profile = await requireCook();

  if (!profile) {
    redirect("/cook");
  }

  const dishId = formData.get("dishId");

  if (typeof dishId !== "string" || !isUuid(dishId)) {
    redirect("/cook");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("dishes")
    .select("photo_path")
    .eq("id", dishId)
    .eq("cook_id", profile.id)
    .maybeSingle();

  const { error } = await supabase
    .from("dishes")
    .delete()
    .eq("id", dishId)
    .eq("cook_id", profile.id);

  if (!error && existing && typeof existing.photo_path === "string") {
    await supabase.storage.from("dish-photos").remove([existing.photo_path]);
  }

  refresh();
  redirect("/cook");
}
