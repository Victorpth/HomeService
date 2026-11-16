import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader, PageMain } from "@/components/page-header";
import { surfaceClassName, textLinkClassName } from "@/components/styles";
import { cuisineLabel, storagePublicUrl } from "@/lib/cook-application";
import { dishPageSize, isUuid, readCookProfile, readDish, readPage } from "@/lib/cook-profile";
import { createClient } from "@/lib/supabase/server";

export default function PublicCookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <PageMain width="3xl">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <PublicCook params={params} searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}

async function PublicCook({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cooks")
    .select("id, full_name, bio, specialties, cuisine_origin, zone, base_price_eur, photo_paths")
    .eq("id", id)
    .maybeSingle();
  const profile = data ? readCookProfile(data) : null;

  if (error) {
    return <p>We could not load this cook.</p>;
  }

  if (!profile) {
    notFound();
  }

  const page = readPage((await searchParams).page);
  const from = (page - 1) * dishPageSize;
  const {
    data: dishRows,
    error: dishError,
    count,
  } = await supabase
    .from("dishes")
    .select("id, cook_id, name, photo_path, price_eur, created_at", { count: "exact" })
    .eq("cook_id", profile.id)
    .order("created_at", { ascending: false })
    .range(from, from + dishPageSize - 1);

  if (dishError) {
    return <p>We could not load this cook.</p>;
  }

  const dishes = (dishRows ?? []).flatMap((row) => {
    const dish = readDish(row);
    return dish ? [dish] : [];
  });
  const photos = profile.photoPaths.flatMap((path) => {
    const url = storagePublicUrl("cook-photos", path);
    return url ? [url] : [];
  });
  const total = count ?? dishes.length;
  const hasNext = from + dishes.length < total;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={profile.fullName} description={cuisineLabel(profile.cuisineOrigin)} />
      <p className="text-sm text-muted">{profile.zone}</p>
      <p className="text-sm font-medium text-copper">From {profile.basePriceEur} EUR</p>
      <p className="whitespace-pre-wrap">{profile.bio}</p>
      <p>{profile.specialties}</p>
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-navy">Dishes</h2>
        {dishes.length === 0 ? (
          <p>{page === 1 ? "No dishes yet." : "No dishes on this page."}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {dishes.map((dish) => {
              const photoUrl = storagePublicUrl("dish-photos", dish.photoPath);

              return (
                <li
                  key={dish.id}
                  className={`flex flex-col gap-3 ${surfaceClassName} p-5`}
                >
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={dish.name}
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <h3 className="text-lg font-semibold text-navy">{dish.name}</h3>
                  <p className="text-sm font-medium text-copper">{dish.priceEur} EUR</p>
                </li>
              );
            })}
          </ul>
        )}
        {page > 1 || hasNext ? (
          <div className="flex gap-4 text-sm">
            {page > 1 ? (
              <Link
                href={page === 2 ? `/cooks/${profile.id}` : `/cooks/${profile.id}?page=${page - 1}`}
                className={textLinkClassName}
              >
                Previous
              </Link>
            ) : null}
            {hasNext ? (
              <Link
                href={`/cooks/${profile.id}?page=${page + 1}`}
                className={textLinkClassName}
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
