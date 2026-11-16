import { isCuisineOrigin, type CuisineOrigin } from "@/lib/cook-application";

export type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

export type ApplicationFieldErrors = {
  bio?: string;
  specialties?: string;
  cuisineOrigin?: string;
  zone?: string;
  basePrice?: string;
  photos?: string;
  cv?: string;
};

const photoTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type PhotoType = keyof typeof photoTypes;

const photoMaxBytes = 5 * 1024 * 1024;
const cvMaxBytes = 10 * 1024 * 1024;

export type PreparedPhoto = {
  file: File;
  contentType: PhotoType;
  extension: (typeof photoTypes)[PhotoType];
};

export type PreparedCv = {
  file: File;
  contentType: "application/pdf";
  extension: "pdf";
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function validateCredentials(input: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const fieldErrors: FieldErrors = {};
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim();
    if (fullName.length < 2 || fullName.length > 80) {
      fieldErrors.fullName = "Enter your full name (2 to 80 characters).";
    }
  }

  if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  } else if (password.length > 72) {
    fieldErrors.password = "Password must be at most 72 characters.";
  }

  return {
    fieldErrors,
    email,
    password,
    fullName: input.fullName?.trim(),
  };
}

function readFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => {
    return value instanceof File && value.size > 0;
  });
}

function hasSignature(bytes: Uint8Array, type: PhotoType | "application/pdf") {
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (type === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

async function matchesType(file: File, type: PhotoType | "application/pdf") {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return hasSignature(bytes, type);
}

function isPhotoType(value: string): value is PhotoType {
  return value === "image/jpeg" || value === "image/png" || value === "image/webp";
}

export async function validateApplication(formData: FormData) {
  const fieldErrors: ApplicationFieldErrors = {};
  const bio = readText(formData, "bio").trim();
  const specialties = readText(formData, "specialties").trim();
  const cuisineOrigin = readText(formData, "cuisineOrigin");
  const zone = readText(formData, "zone").trim();
  const basePriceRaw = readText(formData, "basePrice").trim();
  const photos = readFiles(formData, "photos");
  const cvs = readFiles(formData, "cv");

  if (bio.length < 20 || bio.length > 1000) {
    fieldErrors.bio = "Enter a bio (20 to 1000 characters).";
  }

  if (specialties.length < 2 || specialties.length > 120) {
    fieldErrors.specialties = "Enter your specialties (2 to 120 characters).";
  }

  if (!isCuisineOrigin(cuisineOrigin)) {
    fieldErrors.cuisineOrigin = "Select a cuisine.";
  }

  if (zone.length < 2 || zone.length > 80) {
    fieldErrors.zone = "Enter your area (2 to 80 characters).";
  }

  const basePriceEur = Number(basePriceRaw);
  if (!/^\d+$/.test(basePriceRaw) || basePriceEur < 1 || basePriceEur > 10000) {
    fieldErrors.basePrice = "Enter a base price from 1 to 10000 euros.";
  }

  const preparedPhotos: PreparedPhoto[] = [];
  if (photos.length < 1 || photos.length > 3) {
    fieldErrors.photos = "Add 1 to 3 photos.";
  } else {
    for (const photo of photos) {
      if (!isPhotoType(photo.type) || photo.size > photoMaxBytes) {
        fieldErrors.photos = "Use JPEG, PNG, or WebP photos under 5 MB.";
        break;
      }

      if (!(await matchesType(photo, photo.type))) {
        fieldErrors.photos = "Use JPEG, PNG, or WebP photos under 5 MB.";
        break;
      }

      preparedPhotos.push({
        file: photo,
        contentType: photo.type,
        extension: photoTypes[photo.type],
      });
    }
  }

  let preparedCv: PreparedCv | undefined;
  const cv = cvs[0];
  if (cvs.length !== 1 || !cv || cv.type !== "application/pdf" || cv.size > cvMaxBytes) {
    fieldErrors.cv = "Add one PDF CV under 10 MB.";
  } else if (!(await matchesType(cv, "application/pdf"))) {
    fieldErrors.cv = "Add one PDF CV under 10 MB.";
  } else {
    preparedCv = { file: cv, contentType: "application/pdf", extension: "pdf" };
  }

  if (Object.keys(fieldErrors).length > 0 || !isCuisineOrigin(cuisineOrigin) || !preparedCv) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    application: {
      bio,
      specialties,
      cuisineOrigin: cuisineOrigin as CuisineOrigin,
      zone,
      basePriceEur,
      photos: preparedPhotos,
      cv: preparedCv,
    },
  };
}
