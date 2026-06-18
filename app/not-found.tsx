import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="stat-num text-6xl text-accent">404</p>
      <p className="mt-2 text-lg text-white">Partido o pagina no encontrada</p>
      <Link
        href="/"
        className="mt-6 bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink-950"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
