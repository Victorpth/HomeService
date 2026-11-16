"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";

import { createDish, updateDish, type DishState } from "@/app/cook/actions";
import {
  alertClassName,
  fieldClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  surfaceClassName,
} from "@/components/styles";
import type { Dish } from "@/lib/cook-profile";
import { uploadPublicPhoto } from "@/lib/upload-photo";

function DishFields({
  dish,
  state,
  busy,
  fileRequired,
}: {
  dish?: Dish;
  state: DishState | null;
  busy: boolean;
  fileRequired: boolean;
}) {
  return (
    <>
      {dish ? <input type="hidden" name="dishId" value={dish.id} /> : null}
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor={dish ? `name-${dish.id}` : "dish-name"}>
        Name
        <input
          id={dish ? `name-${dish.id}` : "dish-name"}
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={dish?.name}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.name ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.name}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor={dish ? `price-${dish.id}` : "dish-price"}>
        Price (EUR)
        <input
          id={dish ? `price-${dish.id}` : "dish-price"}
          name="price"
          type="number"
          required
          min={1}
          max={10000}
          step={1}
          defaultValue={dish?.priceEur}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.price ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.price}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor={dish ? `photo-${dish.id}` : "dish-photo"}>
        Photo
        <input
          id={dish ? `photo-${dish.id}` : "dish-photo"}
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={fileRequired}
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper"
        />
      </label>
      {state?.fieldErrors?.photo ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.photo}
        </p>
      ) : null}
      {state?.message ? (
        <p className="text-sm text-ink" role="status">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={dish ? secondaryButtonClassName : primaryButtonClassName}>
        {busy ? "Saving…" : dish ? "Save dish" : "Add dish"}
      </button>
    </>
  );
}

async function submitDish(
  event: FormEvent<HTMLFormElement>,
  currentPath: string | null,
  formAction: (formData: FormData) => void,
  setUploadError: (message: string | null) => void,
  setUploading: (uploading: boolean) => void,
) {
  event.preventDefault();
  setUploadError(null);
  const formData = new FormData(event.currentTarget);
  const file = formData.get("photo");
  formData.delete("photo");

  setUploading(true);

  try {
    let path = currentPath;

    if (file instanceof File && file.size > 0) {
      path = await uploadPublicPhoto(file, "dish-photos");
    }

    if (!path) {
      setUploadError("Add a photo.");
      return;
    }

    formData.append("photoPath", path);
    startTransition(() => {
      formAction(formData);
    });
  } catch (error) {
    setUploadError(error instanceof Error ? error.message : "Could not upload that photo.");
  } finally {
    setUploading(false);
  }
}

export function AddDishForm({ dishCount }: { dishCount: number }) {
  const [state, formAction, pending] = useActionState<DishState | null, FormData>(
    createDish,
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <form
      key={dishCount}
      onSubmit={(event) =>
        submitDish(event, null, formAction, setUploadError, setUploading)
      }
      className={`flex flex-col gap-4 ${surfaceClassName} p-5`}
    >
      <h3 className="text-lg font-semibold text-navy">Add a dish</h3>
      <DishFields state={state} busy={pending || uploading} fileRequired />
      {uploadError ? (
        <p className={alertClassName} role="alert">
          {uploadError}
        </p>
      ) : null}
    </form>
  );
}

export function EditDishForm({ dish }: { dish: Dish }) {
  const [state, formAction, pending] = useActionState<DishState | null, FormData>(
    updateDish,
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) =>
        submitDish(event, dish.photoPath, formAction, setUploadError, setUploading)
      }
      className="flex flex-col gap-4"
    >
      <DishFields dish={dish} state={state} busy={pending || uploading} fileRequired={false} />
      {uploadError ? (
        <p className={alertClassName} role="alert">
          {uploadError}
        </p>
      ) : null}
    </form>
  );
}
