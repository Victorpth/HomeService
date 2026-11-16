import { getSupabaseEnv } from "@/lib/supabase/env";

export const cuisineOrigins = [
  { value: "french", label: "French" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "indian", label: "Indian" },
  { value: "mexican", label: "Mexican" },
  { value: "thai", label: "Thai" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "american", label: "American" },
  { value: "other", label: "Other" },
] as const;

export type CuisineOrigin = (typeof cuisineOrigins)[number]["value"];

export const applicationStatuses = ["pending", "approved", "rejected"] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

const storagePathPattern =
  /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/i;

export function isCuisineOrigin(value: unknown): value is CuisineOrigin {
  return cuisineOrigins.some((cuisine) => cuisine.value === value);
}

export function cuisineLabel(value: CuisineOrigin) {
  return cuisineOrigins.find((cuisine) => cuisine.value === value)?.label ?? value;
}

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return applicationStatuses.some((status) => status === value);
}

export function statusLabel(status: ApplicationStatus) {
  if (status === "pending") {
    return "Pending";
  }

  if (status === "approved") {
    return "Approved";
  }

  return "Rejected";
}

export function isStoragePath(path: string) {
  return storagePathPattern.test(path) && !path.includes("..");
}

export type CookApplicationView = {
  id: string;
  bio: string;
  specialties: string;
  cuisineOrigin: CuisineOrigin;
  zone: string;
  basePriceEur: number;
  photoPaths: string[];
  cvPath: string;
  status: ApplicationStatus;
  createdAt: string;
  applicant: { fullName: string; email: string } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readApplicant(value: unknown) {
  const record = Array.isArray(value) ? value[0] : value;
  if (!isRecord(record)) {
    return null;
  }

  if (typeof record.full_name !== "string" || typeof record.email !== "string") {
    return null;
  }

  return { fullName: record.full_name, email: record.email };
}

export function readCookApplication(value: unknown): CookApplicationView | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  const rawPhotoPaths = Array.isArray(value.photo_paths) ? value.photo_paths : null;
  const photoPaths = rawPhotoPaths
    ? rawPhotoPaths.filter(
        (path): path is string => typeof path === "string" && isStoragePath(path),
      )
    : [];

  if (
    typeof value.bio !== "string" ||
    typeof value.specialties !== "string" ||
    !isCuisineOrigin(value.cuisine_origin) ||
    typeof value.zone !== "string" ||
    typeof value.base_price_eur !== "number" ||
    !Number.isInteger(value.base_price_eur) ||
    !isApplicationStatus(value.status) ||
    typeof value.created_at !== "string" ||
    typeof value.cv_path !== "string" ||
    !isStoragePath(value.cv_path) ||
    !rawPhotoPaths ||
    photoPaths.length < 1 ||
    photoPaths.length > 3 ||
    photoPaths.length !== rawPhotoPaths.length
  ) {
    return null;
  }

  return {
    id: value.id,
    bio: value.bio,
    specialties: value.specialties,
    cuisineOrigin: value.cuisine_origin,
    zone: value.zone,
    basePriceEur: value.base_price_eur,
    photoPaths,
    cvPath: value.cv_path,
    status: value.status,
    createdAt: value.created_at,
    applicant: readApplicant(value.applicant),
  };
}

export function photoPublicUrl(path: string) {
  if (!isStoragePath(path)) {
    return null;
  }

  const { url } = getSupabaseEnv();
  const encoded = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return `${url}/storage/v1/object/public/cook-photos/${encoded}`;
}
