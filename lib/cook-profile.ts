import {
  isCuisineOrigin,
  ownsStoragePath,
  type CuisineOrigin,
} from "@/lib/cook-application";

export const dishPageSize = 20;
export const maxDishes = 40;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function readPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);

  if (!raw || !Number.isInteger(page) || page < 1 || page > 500) {
    return 1;
  }

  return page;
}

export type CookProfile = {
  id: string;
  fullName: string;
  bio: string;
  specialties: string;
  cuisineOrigin: CuisineOrigin;
  zone: string;
  basePriceEur: number;
  photoPaths: string[];
};

export type Dish = {
  id: string;
  cookId: string;
  name: string;
  photoPath: string;
  priceEur: number;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readCookProfile(value: unknown): CookProfile | null {
  if (!isRecord(value) || typeof value.id !== "string" || !isUuid(value.id)) {
    return null;
  }

  const rawPhotoPaths = Array.isArray(value.photo_paths) ? value.photo_paths : null;
  const photoPaths = rawPhotoPaths
    ? rawPhotoPaths.filter(
        (path): path is string =>
          typeof path === "string" && ownsStoragePath(path, value.id as string),
      )
    : [];

  if (
    typeof value.full_name !== "string" ||
    typeof value.bio !== "string" ||
    typeof value.specialties !== "string" ||
    !isCuisineOrigin(value.cuisine_origin) ||
    typeof value.zone !== "string" ||
    typeof value.base_price_eur !== "number" ||
    !Number.isInteger(value.base_price_eur) ||
    !rawPhotoPaths ||
    photoPaths.length < 1 ||
    photoPaths.length > 3 ||
    photoPaths.length !== rawPhotoPaths.length
  ) {
    return null;
  }

  return {
    id: value.id,
    fullName: value.full_name,
    bio: value.bio,
    specialties: value.specialties,
    cuisineOrigin: value.cuisine_origin,
    zone: value.zone,
    basePriceEur: value.base_price_eur,
    photoPaths,
  };
}

export function readDish(value: unknown): Dish | null {
  if (!isRecord(value) || typeof value.id !== "string" || !isUuid(value.id)) {
    return null;
  }

  if (
    typeof value.cook_id !== "string" ||
    !isUuid(value.cook_id) ||
    typeof value.name !== "string" ||
    typeof value.photo_path !== "string" ||
    !ownsStoragePath(value.photo_path, value.cook_id) ||
    typeof value.price_eur !== "number" ||
    !Number.isInteger(value.price_eur) ||
    typeof value.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    cookId: value.cook_id,
    name: value.name,
    photoPath: value.photo_path,
    priceEur: value.price_eur,
    createdAt: value.created_at,
  };
}
