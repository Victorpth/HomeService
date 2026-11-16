"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent, type RefObject } from "react";

import { Stars } from "@/components/rating";
import {
  alertClassName,
  fieldClassName,
  primaryButtonClassName,
  raisedCardClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "@/components/styles";
import { reviewsForCook, sampleCooks, type SampleCook } from "@/lib/sample-cooks";

export type BookingViewer = "anonymous" | "host" | "member";

type RequestNote = {
  cookId: string;
  date: string;
  guests: number;
  message: string;
};

type FieldErrors = {
  date?: string;
  guests?: string;
  message?: string;
};

const guestOptions = Array.from({ length: 12 }, (_, index) => index + 1);

export function CookShowcase({
  viewer,
  links,
}: {
  viewer: BookingViewer;
  links: { href: string; label: string }[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState<RequestNote | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const panelRef = useRef<HTMLElement>(null);
  const [featured, ...others] = sampleCooks;
  const selected = sampleCooks.find((cook) => cook.id === selectedId) ?? null;

  function choose(cook: SampleCook) {
    setSelectedId(cook.id);
    setNote(null);
    setErrors({});
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (!featured) {
    return null;
  }

  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex max-w-xl flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Homemade meals, served at your table
              </h1>
              <p className="text-lg text-paper/80">
                A cook comes to your home. You stay with your guests.
              </p>
            </div>
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
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Cooks for your table</h2>
              <p className="text-sm leading-6 text-paper/75">
                Example cooks, dishes, and reviews, so you can see how a booking looks.
              </p>
            </div>
          </div>
          <CookCard
            cook={featured}
            viewer={viewer}
            selected={featured.id === selectedId}
            priority
            onChoose={() => choose(featured)}
          />
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {others.map((cook) => (
            <li key={cook.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <CookCard
                cook={cook}
                viewer={viewer}
                selected={cook.id === selectedId}
                onChoose={() => choose(cook)}
              />
            </li>
          ))}
        </ul>
        {selected ? (
          <BookingPanel
            panelRef={panelRef}
            cook={selected}
            viewer={viewer}
            note={note?.cookId === selected.id ? note : null}
            errors={errors}
            onSubmit={(next) => {
              setNote(next);
              setErrors({});
            }}
            onInvalid={setErrors}
            onReset={() => {
              setNote(null);
              setErrors({});
            }}
          />
        ) : null}
      </div>
    </>
  );
}

function CookCard({
  cook,
  viewer,
  selected,
  priority = false,
  onChoose,
}: {
  cook: SampleCook;
  viewer: BookingViewer;
  selected: boolean;
  priority?: boolean;
  onChoose: () => void;
}) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden ${raisedCardClassName} ${selected ? "ring-2 ring-copper" : ""}`}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={cook.photo}
          alt={`${cook.dish}, prepared by ${cook.name}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 340px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-navy">{cook.name}</h3>
          <Stars value={cook.rating} />
        </div>
        <p className="text-sm text-muted">
          {cook.cuisine} · {cook.zone}
        </p>
        <p className="text-sm text-ink">{cook.specialty}</p>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted">Signature dish</p>
          <p className="text-sm font-medium text-navy">{cook.dish}</p>
        </div>
        <p className="mt-auto text-sm font-medium text-copper">From {cook.priceEur} EUR</p>
        <BookControl viewer={viewer} onChoose={onChoose} />
      </div>
    </article>
  );
}

function BookControl({ viewer, onChoose }: { viewer: BookingViewer; onChoose: () => void }) {
  if (viewer === "anonymous") {
    return (
      <Link href="/login" className={`${primaryButtonClassName} w-full`}>
        Book
      </Link>
    );
  }

  return (
    <button type="button" onClick={onChoose} className={`${primaryButtonClassName} w-full`}>
      Book
    </button>
  );
}

function BookingPanel({
  panelRef,
  cook,
  viewer,
  note,
  errors,
  onSubmit,
  onInvalid,
  onReset,
}: {
  panelRef: RefObject<HTMLElement | null>;
  cook: SampleCook;
  viewer: BookingViewer;
  note: RequestNote | null;
  errors: FieldErrors;
  onSubmit: (note: RequestNote) => void;
  onInvalid: (errors: FieldErrors) => void;
  onReset: () => void;
}) {
  const reviews = reviewsForCook(cook.id);
  const minDate = todayInputValue();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const date = String(formData.get("date") ?? "");
    const guests = Number(formData.get("guests"));
    const message = String(formData.get("message") ?? "").trim();
    const nextErrors: FieldErrors = {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < minDate) {
      nextErrors.date = "Choose a date from today onward.";
    }

    if (!guestOptions.includes(guests)) {
      nextErrors.guests = "Choose the number of guests.";
    }

    if (message.length > 400) {
      nextErrors.message = "Keep the note under 400 characters.";
    }

    if (nextErrors.date || nextErrors.guests || nextErrors.message) {
      onInvalid(nextErrors);
      return;
    }

    onSubmit({ cookId: cook.id, date, guests, message });
  }

  return (
    <section
      ref={panelRef}
      id="booking"
      aria-label={`Book ${cook.name}`}
      className={`${raisedCardClassName} scroll-mt-6 p-5 sm:p-6`}
    >
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
          <Image
            src={cook.photo}
            alt=""
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-semibold tracking-tight text-navy">{cook.name}</h3>
            <p className="text-sm text-muted">
              {cook.specialty} · From {cook.priceEur} EUR
            </p>
          </div>
          <ul className="grid gap-3">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-col gap-1">
                <Stars value={review.rating} />
                <p className="text-sm leading-6 text-ink">{review.comment}</p>
                <p className="text-xs text-muted">{review.author}</p>
              </li>
            ))}
          </ul>
          {viewer === "member" ? (
            <p className="text-sm text-ink">Only a host can request a cook.</p>
          ) : note ? (
            <div className="flex flex-col gap-3" role="status">
              <h4 className="text-lg font-semibold text-navy">Request noted</h4>
              <p className="text-sm text-ink">
                {cook.name} · {formatDate(note.date)} · {note.guests}{" "}
                {note.guests === 1 ? "guest" : "guests"}
              </p>
              {note.message ? <p className="text-sm text-muted">{note.message}</p> : null}
              <p className="text-sm text-muted">
                This sample request is not saved, and nothing is charged.
              </p>
              <button type="button" onClick={onReset} className={secondaryButtonClassName}>
                Change request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="booking-date">
                  Date
                  <input
                    id="booking-date"
                    name="date"
                    type="date"
                    min={minDate}
                    required
                    className={fieldClassName}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="booking-guests">
                  Guests
                  <select
                    id="booking-guests"
                    name="guests"
                    defaultValue="4"
                    className={fieldClassName}
                  >
                    {guestOptions.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {errors.date ? (
                <p className={alertClassName} role="alert">
                  {errors.date}
                </p>
              ) : null}
              {errors.guests ? (
                <p className={alertClassName} role="alert">
                  {errors.guests}
                </p>
              ) : null}
              <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="booking-message">
                Note for the cook
                <textarea
                  id="booking-message"
                  name="message"
                  maxLength={400}
                  className={textareaClassName}
                  placeholder="Allergies, timing, or the kind of evening you want."
                />
              </label>
              {errors.message ? (
                <p className={alertClassName} role="alert">
                  {errors.message}
                </p>
              ) : null}
              <button type="submit" className={`${primaryButtonClassName} w-fit`}>
                Request booking
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function todayInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
