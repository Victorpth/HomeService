import Link from "next/link";

import { deleteDish } from "@/app/cook/actions";
import { AddDishForm, EditDishForm } from "@/app/cook/dish-forms";
import { ProfileForm } from "@/app/cook/profile-form";
import { secondaryButtonClassName, surfaceClassName, textLinkClassName } from "@/components/styles";
import { requireRole } from "@/lib/auth";
import { storagePublicUrl } from "@/lib/cook-application";
import { dishPageSize, readCookProfile, readDish, readPage } from "@/lib/cook-profile";
import { createClient } from "@/lib/supabase/server";

export async function CookStudio({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const result = await requireRole("cook");

  if (result.status !== "ok") {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cooks")
    .select("id, full_name, bio, specialties, cuisine_origin, zone, base_price_eur, photo_paths")
    .eq("id", result.profile.id)
    .maybeSingle();

  if (error) {
    return <p>We could not load your profile.</p>;
  }

  const profile = data ? readCookProfile(data) : null;

  if (data && !profile) {
    return <p>We could not load your profile.</p>;
  }

  if (!profile) {
    return (
      <section className={`flex flex-col gap-3 ${surfaceClassName} p-6`}>
        <h2 className="text-xl font-semibold text-navy">Your profile is not ready</h2>
        <p>
          Your cook profile is created when an admin approves your application. Until
          then, it is not shown publicly.
        </p>
      </section>
    );
  }

  const photos = profile.photoPaths.flatMap((path) => {
    const url = storagePublicUrl("cook-photos", path);
    return url ? [{ path, url }] : [];
  });
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
    return <p>We could not load your dishes.</p>;
  }

  const dishes = (dishRows ?? []).flatMap((row) => {
    const dish = readDish(row);
    return dish ? [dish] : [];
  });
  const total = count ?? dishes.length;
  const hasNext = from + dishes.length < total;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-navy">Your profile</h2>
          <Link href={`/cooks/${profile.id}`} className={`text-sm ${textLinkClassName}`}>
            View public profile
          </Link>
        </div>
        <ProfileForm key={profile.photoPaths.join("|")} profile={profile} photos={photos} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-navy">Your dishes</h2>
        <AddDishForm dishCount={total} />
        {dishes.length === 0 ? (
          <p>{page === 1 ? "No dishes yet." : "No dishes on this page."}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {dishes.map((dish) => {
              const photoUrl = storagePublicUrl("dish-photos", dish.photoPath);

              return (
                <article
                  key={dish.id}
                  className={`flex flex-col gap-4 ${surfaceClassName} p-5`}
                >
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={dish.name}
                      className="aspect-video w-full rounded-lg object-cover sm:max-w-xs"
                    />
                  ) : null}
                  <p className="text-sm font-medium text-copper">{dish.priceEur} EUR</p>
                  <EditDishForm dish={dish} />
                  <form action={deleteDish}>
                    <input type="hidden" name="dishId" value={dish.id} />
                    <button type="submit" className={secondaryButtonClassName}>
                      Delete dish
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
        {page > 1 || hasNext ? (
          <div className="flex gap-4 text-sm">
            {page > 1 ? (
              <Link
                href={page === 2 ? "/cook" : `/cook?page=${page - 1}`}
                className={textLinkClassName}
              >
                Previous
              </Link>
            ) : null}
            {hasNext ? (
              <Link href={`/cook?page=${page + 1}`} className={textLinkClassName}>
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
