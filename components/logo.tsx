import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-paper">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path fill="currentColor" d="M16 2.5 30 14h-3v15H5V14H2L16 2.5Z" />
        <path
          fill="#1E2A3A"
          d="M11.2 18.2h9.6c.45 0 .85.32.95.76l.55 2.7a1.05 1.05 0 0 1-1.03 1.26h-10.5a1.05 1.05 0 0 1-1.03-1.26l.55-2.7c.1-.44.5-.76.95-.76Z"
        />
        <path fill="#1E2A3A" d="M12.3 16.6h7.4v2h-7.4z" />
        <path fill="#1E2A3A" d="M8.6 18.7h2.2v1.5H8.6zm12.6 0h2.2v1.5h-2.2z" />
        <path
          d="M13.2 14.4c.35-.9.85-.9 1.2 0 .35.9.85.9 1.2 0 .35-.9.85-.9 1.2 0"
          fill="none"
          stroke="#B07A3F"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight">HomeService</span>
    </Link>
  );
}
