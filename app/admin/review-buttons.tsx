"use client";

import { useActionState } from "react";

import { reviewApplication, type ReviewState } from "@/app/admin/review-actions";
import {
  alertClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";

export function ReviewButtons({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState<ReviewState | null, FormData>(
    reviewApplication,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <div className="flex gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className={primaryButtonClassName}
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending}
          className={secondaryButtonClassName}
        >
          Reject
        </button>
      </div>
      {state?.message ? (
        <p className={alertClassName} role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
