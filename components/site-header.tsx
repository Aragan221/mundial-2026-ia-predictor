"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "IA" },
  { href: "/en-vivo", label: "En vivo" },
  { href: "/parleys", label: "Parleys" },
  { href: "/mi-polla", label: "Mi Polla" },
  { href: "/grupos", label: "Grupos" },
  { href: "/partidos", label: "Partidos" },
  { href: "/campeon", label: "Campeon" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center bg-accent text-[11px] font-bold text-ink-950">
            26
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight">
            MUNDIAL<span className="text-accent">26</span>
            <span className="ml-2 hidden text-ink-500 sm:inline">
              IA PREDICTOR
            </span>
          </span>
        </Link>

        <nav className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-accent text-ink-950"
                    : "text-ink-500 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
