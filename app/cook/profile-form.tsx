"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";

import { updateCookProfile, type ProfileState } from "@/app/cook/actions";
import {
  alertClassName,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  surfaceClassName,
  textareaClassName,
} from "@/components/styles";
import { cuisineOrigins } from "@/lib/cook-application";
import type { CookProfile } from "@/lib/cook-profile";
import { uploadPublicPhoto } from "@/lib/upload-photo";

export function ProfileForm({
  profile,
  photos,
}: {
  profile: CookProfile;
  photos: { path: string; url: string }[];
}) {
  const [state, formAction, pending] = useActionState<ProfileState | null, FormData>(
    updateCookProfile,
    null,
  );
  const [kept, setKept] = useState(photos);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData
      .getAll("newPhotos")
      .filter((value): value is File => value instanceof File && value.size > 0);
    formData.delete("newPhotos");

    if (kept.length + files.length < 1 || kept.length + files.length > 3) {
      setUploadError("Keep 1 to 3 photos.");
      return;
    }

    setUploading(true);

    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadPublicPhoto(file, "cook-photos"));
      }

      for (const photo of kept) {
        formData.append("photoPath", photo.path);
      }

      for (const path of uploaded) {
        formData.append("photoPath", path);
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not upload that photo.");
    } finally {
      setUploading(false);
    }
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-6 ${surfaceClassName} p-6`}>
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="bio">
        Bio
        <textarea
          id="bio"
          name="bio"
          required
          minLength={20}
          maxLength={1000}
          defaultValue={profile.bio}
          className={textareaClassName}
        />
      </label>
      {state?.fieldErrors?.bio ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.bio}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="specialties">
        Specialties
        <input
          id="specialties"
          name="specialties"
          type="text"
          required
          minLength={2}
          maxLength={120}
          defaultValue={profile.specialties}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.specialties ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.specialties}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="cuisineOrigin">
        Cuisine
        <select
          id="cuisineOrigin"
          name="cuisineOrigin"
          required
          defaultValue={profile.cuisineOrigin}
          className={fieldClassName}
        >
          {cuisineOrigins.map((cuisine) => (
            <option key={cuisine.value} value={cuisine.value}>
              {cuisine.label}
            </option>
          ))}
        </select>
      </label>
      {state?.fieldErrors?.cuisineOrigin ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.cuisineOrigin}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="zone">
        Area
        <input
          id="zone"
          name="zone"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={profile.zone}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.zone ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.zone}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="basePrice">
        Base price (EUR)
        <input
          id="basePrice"
          name="basePrice"
          type="number"
          required
          min={1}
          max={10000}
          step={1}
          defaultValue={profile.basePriceEur}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.basePrice ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.basePrice}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-ink">Photos (1 to 3)</legend>
        {kept.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3">
            {kept.map((photo, index) => (
              <li key={photo.path} className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={() => setKept((current) => current.filter((item) => item.path !== photo.path))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Add at least one photo.</p>
        )}
        <input
          name="newPhotos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper"
        />
      </fieldset>
      {state?.fieldErrors?.photos ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.photos}
        </p>
      ) : null}
      {uploadError ? (
        <p className={alertClassName} role="alert">
          {uploadError}
        </p>
      ) : null}
      {state?.message ? (
        <p className="text-sm text-ink" role="status">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={primaryButtonClassName}>
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
