"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "IA" },
  { href: "/en-vivo", label: "En vivo" },
  { href: "/parleys", label: "Parleys" },
  { href: "/grupos", label: "Grupos" },
  { href: "/partidos", label: "Partidos" },
  { href: "/campeon", label: "Campeon" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
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

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
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
