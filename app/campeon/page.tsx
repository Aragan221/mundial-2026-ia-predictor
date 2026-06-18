import { getTournamentProjection } from "@/lib/model/montecarlo";
import { Flag } from "@/components/flag";
import { SectionTitle, ProbBar } from "@/components/ui";
import { pctRaw } from "@/lib/format";

export const metadata = {
  title: "Camino al titulo · Mundial 2026 IA Predictor",
};

export default function CampeonPage() {
  const t = getTournamentProjection();
  const champ = t.champion[0];
  const maxChamp = champ?.pct ?? 1;
  const maxFinal = t.finalist[0]?.pct ?? 1;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">
          Camino al titulo
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Resultado de correr el torneo completo{" "}
          {t.simulations.toLocaleString("es")} veces (Monte Carlo): fase de
          grupos, mejores terceros y eliminatorias hasta la final.
        </p>
      </div>

      {/* Favorito destacado */}
      <section className="border border-accent bg-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Flag teamId={champ.team.id} size={80} className="h-12" />
            <div>
              <p className="label mb-1">Mayor probabilidad de campeon</p>
              <p className="text-3xl font-semibold tracking-tightest text-white">
                {champ.team.name}
              </p>
            </div>
          </div>
          <p className="stat-num text-5xl text-accent">{pctRaw(champ.pct)}</p>
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Campeon */}
        <section>
          <SectionTitle index="01">Probabilidad de ser campeon</SectionTitle>
          <div className="card divide-y divide-ink-800">
            {t.champion.slice(0, 16).map((c, i) => (
              <Row
                key={c.team.id}
                i={i}
                teamId={c.team.id}
                name={c.team.name}
                pctValue={c.pct}
                rel={c.pct / maxChamp}
              />
            ))}
          </div>
        </section>

        {/* Finalistas */}
        <section>
          <SectionTitle index="02">Probabilidad de llegar a la final</SectionTitle>
          <div className="card divide-y divide-ink-800">
            {t.finalist.slice(0, 16).map((c, i) => (
              <Row
                key={c.team.id}
                i={i}
                teamId={c.team.id}
                name={c.team.name}
                pctValue={c.pct}
                rel={c.pct / maxFinal}
                color="bg-signal-draw"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  i,
  teamId,
  name,
  pctValue,
  rel,
  color = "bg-accent",
}: {
  i: number;
  teamId: string;
  name: string;
  pctValue: number;
  rel: number;
  color?: string;
}) {
  return (
    <div className="grid grid-cols-[2rem_2rem_1fr_auto] items-center gap-3 px-4 py-3">
      <span className="stat-num text-sm text-ink-500">
        {String(i + 1).padStart(2, "0")}
      </span>
      <Flag teamId={teamId} size={40} className="h-4" />
      <div className="min-w-0">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate text-sm text-white">{name}</span>
          <span className="stat-num text-sm text-accent">
            {pctRaw(pctValue)}
          </span>
        </div>
        <ProbBar value={rel} color={color} />
      </div>
    </div>
  );
}
