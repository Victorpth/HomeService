"use client";

import { useActionState } from "react";

import { applyToCook, type ApplyState } from "@/app/apply/actions";
import {
  alertClassName,
  fieldClassName,
  primaryButtonClassName,
  textareaClassName,
} from "@/components/styles";
import { cuisineOrigins } from "@/lib/cook-application";

export function ApplyForm() {
  const [state, formAction, pending] = useActionState<ApplyState | null, FormData>(
    applyToCook,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="bio">
        Bio
        <textarea
          id="bio"
          name="bio"
          required
          minLength={20}
          maxLength={1000}
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
          defaultValue=""
          className={fieldClassName}
        >
          <option value="" disabled>
            Select a cuisine
          </option>
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
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.basePrice ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.basePrice}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="photos">
        Photos (1 to 3)
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper"
        />
      </label>
      {state?.fieldErrors?.photos ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.photos}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="cv">
        CV (PDF)
        <input
          id="cv"
          name="cv"
          type="file"
          accept="application/pdf"
          required
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper"
        />
      </label>
      {state?.fieldErrors?.cv ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.cv}
        </p>
      ) : null}

      {state?.message ? (
        <p className="text-sm text-ink" role="status">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
