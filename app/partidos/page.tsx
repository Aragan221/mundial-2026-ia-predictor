import Link from "next/link";
import { GROUPS } from "@/lib/data/teams";
import { fixturesByGroup } from "@/lib/data/fixtures";
import { predictMatch } from "@/lib/model/predict";
import { Flag } from "@/components/flag";
import { SectionTitle } from "@/components/ui";
import { pct, dateLabel } from "@/lib/format";

export const metadata = {
  title: "Partidos · Mundial 2026 IA Predictor",
};

export default function PartidosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">
          72 partidos
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Fase de grupos completa. Toca un partido para ver todos los mercados:
          1X2, goles, BTTS, marcador exacto, tarjetas, corners y goleadores.
        </p>
      </div>

      {GROUPS.map((g) => (
        <section key={g}>
          <SectionTitle index={`GR ${g}`}>Grupo {g}</SectionTitle>
          <div className="card divide-y divide-ink-800">
            {fixturesByGroup(g).map((f) => {
              const p = predictMatch(f);
              const { homeWin, draw, awayWin } = p.markets;
              const fav =
                homeWin >= draw && homeWin >= awayWin
                  ? "home"
                  : awayWin >= draw
                    ? "away"
                    : "draw";
              return (
                <Link
                  key={f.id}
                  href={`/partido/${f.id}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-800/50"
                >
                  <span className="label w-12">{dateLabel(f.date)}</span>

                  <div className="flex items-center justify-center gap-3 text-sm">
                    <span
                      className={`flex items-center gap-2 ${
                        fav === "home" ? "text-white" : "text-ink-500"
                      }`}
                    >
                      <Flag teamId={p.home.id} size={20} className="h-3" />
                      {p.home.name}
                    </span>
                    <span className="font-mono text-xs text-ink-600">vs</span>
                    <span
                      className={`flex items-center gap-2 ${
                        fav === "away" ? "text-white" : "text-ink-500"
                      }`}
                    >
                      {p.away.name}
                      <Flag teamId={p.away.id} size={20} className="h-3" />
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                    <Cell label="1" value={pct(homeWin)} on={fav === "home"} />
                    <Cell label="X" value={pct(draw)} on={fav === "draw"} />
                    <Cell label="2" value={pct(awayWin)} on={fav === "away"} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Cell({
  label,
  value,
  on,
}: {
  label: string;
  value: string;
  on: boolean;
}) {
  return (
    <span
      className={`flex w-12 flex-col items-center border px-1 py-0.5 ${
        on ? "border-accent text-accent" : "border-ink-700 text-ink-500"
      }`}
    >
      <span className="text-[9px] uppercase">{label}</span>
      <span className="text-xs">{value}</span>
    </span>
  );
}
