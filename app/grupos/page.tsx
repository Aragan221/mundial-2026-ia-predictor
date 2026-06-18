import { GROUPS } from "@/lib/data/teams";
import { projectGroup } from "@/lib/model/group-standings";
import { Flag } from "@/components/flag";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Grupos · Mundial 2026 IA Predictor",
};

export default function GruposPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">Grupos</h1>
        <p className="mt-1 text-sm text-ink-500">
          Clasificacion proyectada por puntos esperados (xPts). Los dos primeros
          de cada grupo avanzan; el tercero disputa uno de los 8 cupos extra.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => {
          const table = projectGroup(g);
          return (
            <div key={g} className="card p-4">
              <SectionTitle index={`GR ${g}`}>Grupo {g}</SectionTitle>
              <div className="grid grid-cols-[1.5rem_1.5rem_1fr_auto_auto] items-center gap-x-3 gap-y-1">
                <span className="label" />
                <span className="label" />
                <span className="label">Seleccion</span>
                <span className="label text-right">xGD</span>
                <span className="label text-right">xPts</span>

                {table.map((row, i) => (
                  <Row key={row.team.id} i={i} row={row} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  i,
  row,
}: {
  i: number;
  row: ReturnType<typeof projectGroup>[number];
}) {
  const qualifies = i <= 1;
  const disputes = i === 2;
  const xgd = row.xGoalsFor - row.xGoalsAgainst;
  return (
    <>
      <span className="stat-num text-xs text-ink-500">{i + 1}</span>
      <span
        className={`h-2 w-2 ${
          qualifies ? "bg-accent" : disputes ? "bg-signal-draw" : "bg-ink-600"
        }`}
        title={row.advanceHint}
      />
      <span className="flex items-center gap-2 truncate text-sm text-white">
        <Flag teamId={row.team.id} size={20} className="h-3" />
        <span className="truncate">{row.team.name}</span>
      </span>
      <span className="stat-num text-right text-xs text-ink-500">
        {xgd >= 0 ? "+" : ""}
        {xgd.toFixed(1)}
      </span>
      <span className="stat-num text-right text-sm text-accent">
        {row.xPoints.toFixed(1)}
      </span>
    </>
  );
}
