import Link from "next/link";
import type { ReactNode } from "react";

const widths = {
  md: "max-w-md",
  xl: "max-w-xl",
  "3xl": "max-w-3xl",
} as const;

export function PageMain({
  children,
  width = "md",
}: {
  children: ReactNode;
  width?: keyof typeof widths;
}) {
  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col gap-8 px-6 py-12 ${widths[width]}`}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  description,
  backHref = "/",
  backLabel = "Home",
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link href={backHref} className="w-fit text-sm font-medium text-copper hover:underline">
        {backLabel}
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-navy">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
