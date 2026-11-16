import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-navy/10">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-muted">
        <p>HomeService. Book a cook at home.</p>
        <Link href="/" className="font-medium text-copper hover:underline">
          Home
        </Link>
      </div>
    </footer>
  );
}
