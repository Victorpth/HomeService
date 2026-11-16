import Link from "next/link";

import { ReviewButtons } from "@/app/admin/review-buttons";
import { ApplicationSummary } from "@/components/application-summary";
import { textLinkClassName } from "@/components/styles";
import { requireRole } from "@/lib/auth";
import { readCookApplication } from "@/lib/cook-application";
import { signCvUrl } from "@/lib/cv-url";
import { createClient } from "@/lib/supabase/server";

const pageSize = 20;

function readPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);

  if (!raw || !Number.isInteger(page) || page < 1 || page > 500) {
    return 1;
  }

  return page;
}

export async function PendingApplications({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const result = await requireRole("admin");

  if (result.status !== "ok") {
    return null;
  }

  const page = readPage((await searchParams).page);
  const from = (page - 1) * pageSize;
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("cook_applications")
    .select(
      "id, bio, specialties, cuisine_origin, zone, base_price_eur, photo_paths, cv_path, status, created_at, applicant:profiles!user_id(full_name, email)",
      { count: "exact" },
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    return <p>We could not load applications.</p>;
  }

  const applications = (data ?? []).flatMap((row) => {
    const application = readCookApplication(row);
    return application ? [application] : [];
  });

  if (applications.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="text-xl font-semibold text-navy">Pending applications</h2>
        <p>{page === 1 ? "No applications waiting." : "No applications on this page."}</p>
        {page > 1 ? (
          <Link
            href={page === 2 ? "/admin" : `/admin?page=${page - 1}`}
            className={`text-sm ${textLinkClassName}`}
          >
            Previous
          </Link>
        ) : null}
      </div>
    );
  }

  const cards = await Promise.all(
    applications.map(async (application) => ({
      application,
      cvUrl: await signCvUrl(application.cvPath),
    })),
  );
  const total = count ?? applications.length;
  const hasNext = from + applications.length < total;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-navy">Pending applications</h2>
      <div className="flex flex-col gap-4">
        {cards.map(({ application, cvUrl }) => (
          <ApplicationSummary
            key={application.id}
            application={application}
            cvUrl={cvUrl}
            actions={<ReviewButtons applicationId={application.id} />}
          />
        ))}
      </div>
      {page > 1 || hasNext ? (
        <div className="flex gap-4 text-sm">
          {page > 1 ? (
            <Link
              href={page === 2 ? "/admin" : `/admin?page=${page - 1}`}
              className={textLinkClassName}
            >
              Previous
            </Link>
          ) : null}
          {hasNext ? (
            <Link href={`/admin?page=${page + 1}`} className={textLinkClassName}>
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
