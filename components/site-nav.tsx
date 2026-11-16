"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/sign-out";
import type { AccountLink } from "@/lib/account-nav";

const linkClassName =
  "inline-flex min-h-11 items-center rounded-full px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function SiteNav({
  links,
  showSignOut,
}: {
  links: AccountLink[];
  showSignOut: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex flex-wrap items-center justify-end gap-1">
      {links.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`${linkClassName} ${
              active ? "font-medium text-copper" : "text-paper/80 hover:text-paper"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      {showSignOut ? (
        <form action={signOut}>
          <button
            type="submit"
            className={`${linkClassName} text-paper/80 hover:text-paper`}
          >
            Sign out
          </button>
        </form>
      ) : null}
    </nav>
  );
}
