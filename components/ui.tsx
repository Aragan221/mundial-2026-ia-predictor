import { pct } from "@/lib/format";

// Barra de probabilidad horizontal (estilo terminal de datos).
export function ProbBar({
  value,
  color = "bg-accent",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="prob-track">
      <div
        className={`h-full ${color}`}
        style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

// Etiqueta de seccion con numeracion estilo broadcast.
export function SectionTitle({
  index,
  children,
}: {
  index?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {index && (
        <span className="font-mono text-xs text-accent">{index}</span>
      )}
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
        {children}
      </h2>
      <div className="h-px flex-1 bg-ink-800" />
    </div>
  );
}

// Fila de mercado: etiqueta + barra + porcentaje grande.
export function MarketRow({
  label,
  value,
  color = "bg-accent",
  highlight = false,
}: {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-2">
      <span
        className={`text-sm ${highlight ? "text-white" : "text-ink-500"}`}
      >
        {label}
      </span>
      <span
        className={`stat-num text-lg ${
          highlight ? "text-accent" : "text-white"
        }`}
      >
        {pct(value)}
      </span>
      <div className="col-span-2">
        <ProbBar value={value} color={color} />
      </div>
    </div>
  );
}

// Bloque de numero grande con etiqueta.
export function BigStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-4">
      <p className="label mb-1">{label}</p>
      <p className="stat-num text-3xl text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-500">{sub}</p>}
    </div>
  );
}

// Etiqueta de confianza del partido.
export function ConfidenceTag({ value }: { value: number }) {
  const tone =
    value >= 65
      ? "text-signal-win"
      : value >= 40
        ? "text-signal-draw"
        : "text-signal-loss";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
      <span className={`h-1.5 w-1.5 ${tone.replace("text-", "bg-")}`} />
      Confianza <span className={tone}>{value}</span>
    </span>
  );
}
