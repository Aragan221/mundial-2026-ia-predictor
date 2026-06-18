// Utilidades de formato para la UI.

export function pct(p: number, decimals = 0): string {
  return `${(p * 100).toFixed(decimals)}%`;
}

export function pctRaw(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function dateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Color de acento segun probabilidad (verde alto, ambar medio, rojo bajo).
export function probColor(p: number): string {
  if (p >= 0.55) return "text-signal-win";
  if (p >= 0.33) return "text-signal-draw";
  return "text-signal-loss";
}
