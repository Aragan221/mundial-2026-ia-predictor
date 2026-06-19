import { GROUPS } from "@/lib/data/teams";
import { fixturesByGroup } from "@/lib/data/fixtures";
import { predictMatch } from "@/lib/model/predict";
import { Flag } from "@/components/flag";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Mi Polla · Mundial 2026 IA Predictor",
};

function sign(p: {
  homeWin: number;
  draw: number;
  awayWin: number;
}): { code: "1" | "X" | "2"; color: string } {
  if (p.homeWin >= p.draw && p.homeWin >= p.awayWin)
    return { code: "1", color: "bg-signal-win text-ink-950" };
  if (p.awayWin >= p.draw) return { code: "2", color: "bg-signal-loss text-ink-950" };
  return { code: "X", color: "bg-signal-draw text-ink-950" };
}

export default function MiPollaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">Mi Polla</h1>
        <p className="mt-1 text-sm text-ink-500">
          El marcador mas probable que pronostica el modelo para cada partido.
          Usalo de guia para llenar tu polla del Mundial.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g} className="card p-4">
            <SectionTitle index={`GR ${g}`}>Grupo {g}</SectionTitle>
            <div className="divide-y divide-ink-800">
              {fixturesByGroup(g).map((f) => {
                const p = predictMatch(f);
                const s = p.markets.topScores[0];
                const sg = sign(p.markets);
                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2"
                  >
                    <span className="flex items-center justify-end gap-2 truncate text-right text-sm text-white">
                      <span className="truncate">{p.home.name}</span>
                      <Flag teamId={p.home.id} size={20} className="h-3" />
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="stat-num text-base text-white">
                        {s.home}-{s.away}
                      </span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center font-mono text-[10px] font-bold ${sg.color}`}
                      >
                        {sg.code}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 truncate text-sm text-white">
                      <Flag teamId={p.away.id} size={20} className="h-3" />
                      <span className="truncate">{p.away.name}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="label">
        Marcador mas probable segun el modelo Poisson. Analisis estadistico de
        entretenimiento, no es asesoria de apuestas.
      </p>
    </div>
  );
}
