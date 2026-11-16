import Link from "next/link";
import { Suspense } from "react";

import { getAccountLinks } from "@/lib/account-nav";

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
      <section className="bg-navy text-paper">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Homemade meals, served at your table
            </h1>
            <p className="text-lg text-paper/80">Book a local home cook.</p>
          </div>
          <Suspense fallback={<p className="text-sm text-paper/70">Loading…</p>}>
            <HomeActions />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-navy">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-copper text-sm font-semibold text-paper">
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
    </main>
  );
}

async function HomeActions() {
  const links = await getAccountLinks();

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            index === 0
              ? "inline-flex h-11 items-center justify-center rounded-full bg-paper px-5 text-sm font-medium text-navy"
              : "inline-flex h-11 items-center justify-center rounded-full border border-paper/40 px-5 text-sm font-medium text-paper"
          }
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
