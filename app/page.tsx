import { Suspense } from "react";

import { CookShowcase, type BookingViewer } from "@/components/home/cook-showcase";
import { Stars } from "@/components/rating";
import { surfaceClassName } from "@/components/styles";
import { getAccountLinks } from "@/lib/account-nav";
import { getProfile } from "@/lib/auth";
import { sampleCooks, sampleReviews } from "@/lib/sample-cooks";

const steps = [
  {
    title: "Find a cook",
    body: "Choose a cook whose cooking fits the meal you want at home.",
  },
  {
    title: "Book and pay",
    body: "Send a request and pay online. The cook confirms the booking.",
  },
  {
    title: "Enjoy the meal at home",
    body: "The meal is prepared at your place, so you can stay with your guests.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<HomeFallback />}>
        <Home />
      </Suspense>
    </main>
  );
}

function HomeFallback() {
  return (
    <section className="bg-navy text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-14">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Homemade meals, served at your table
        </h1>
        <p className="text-sm text-paper/70">Loading…</p>
      </div>
    </section>
  );
}

async function Home() {
  const [links, profile] = await Promise.all([getAccountLinks(), getProfile()]);
  const viewer: BookingViewer = !profile
    ? "anonymous"
    : profile.role === "host"
      ? "host"
      : "member";
  const highlights = sampleCooks.flatMap((cook) => {
    const review = sampleReviews.find((item) => item.cookId === cook.id);
    return review ? [{ review, cook }] : [];
  });

  return (
    <>
      <CookShowcase viewer={viewer} links={links} />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-navy">Recent reviews</h2>
          <p className="text-sm text-muted">Example notes from hosts.</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {highlights.map(({ review, cook }) => (
            <li key={review.id} className={`${surfaceClassName} flex flex-col gap-3 p-6`}>
              <Stars value={review.rating} />
              <p className="text-base leading-7 text-ink">&ldquo;{review.comment}&rdquo;</p>
              <p className="text-sm text-muted">
                {review.author} · {cook.name}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight text-navy">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className={`${surfaceClassName} flex flex-col gap-4 p-6`}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-paper">
                {index + 1}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-navy">{step.title}</h3>
                <p className="text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
