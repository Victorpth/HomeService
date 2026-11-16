import type { ReactNode } from "react";

import { textLinkClassName } from "@/components/styles";
import {
  cuisineLabel,
  photoPublicUrl,
  statusLabel,
  type CookApplicationView,
} from "@/lib/cook-application";

export function ApplicationSummary({
  application,
  cvUrl,
  actions,
}: {
  application: CookApplicationView;
  cvUrl: string | null;
  actions?: ReactNode;
}) {
  const submitted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(application.createdAt));
  const photos = application.photoPaths.flatMap((path) => {
    const url = photoPublicUrl(path);
    return url ? [url] : [];
  });

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      {application.applicant ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-navy">{application.applicant.fullName}</h2>
          <p className="text-sm text-muted">{application.applicant.email}</p>
        </div>
      ) : null}
      <p className="text-sm font-medium text-copper">
        Status: {statusLabel(application.status)}
      </p>
      <p className="text-sm text-muted">Submitted on {submitted}</p>
      <dl className="grid gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-muted">Bio</dt>
          <dd className="whitespace-pre-wrap">{application.bio}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted">Specialties</dt>
          <dd>{application.specialties}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted">Cuisine</dt>
          <dd>{cuisineLabel(application.cuisineOrigin)}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted">Area</dt>
          <dd>{application.zone}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted">Base price</dt>
          <dd>{application.basePriceEur} EUR</dd>
        </div>
      </dl>
      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}
      {cvUrl ? (
        <a href={cvUrl} target="_blank" rel="noreferrer" className={`text-sm ${textLinkClassName}`}>
          View CV
        </a>
      ) : (
        <p className="text-sm">The CV link is unavailable right now.</p>
      )}
      {actions}
    </article>
  );
}
