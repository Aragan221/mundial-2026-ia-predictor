import Link from "next/link";
import { getTournamentProjection } from "@/lib/model/montecarlo";
import { Flag } from "@/components/flag";
import { SectionTitle, ProbBar } from "@/components/ui";
import { pctRaw } from "@/lib/format";

export default function HomePage() {
  const t = getTournamentProjection();
  const champ = t.champion[0];
  const topContenders = t.champion.slice(0, 12);
  const maxPct = topContenders[0]?.pct ?? 1;

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="border border-ink-700 bg-ink-900/60 p-6 sm:p-10">
        <p className="label mb-4">
          Asi predice la IA el Mundial 2026 · {t.simulations.toLocaleString("es")} simulaciones Monte Carlo
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tightest sm:text-6xl">
              El favorito es
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <Flag teamId={champ.team.id} size={80} className="h-12" />
              <span className="glow-accent anim-pop text-4xl font-semibold tracking-tightest text-accent sm:text-6xl">
                {champ.team.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="label mb-1">Prob. de campeon</p>
            <p className="stat-num anim-pop text-6xl text-white sm:text-7xl">
              {pctRaw(champ.pct)}
            </p>
          </div>
        </div>
      </section>

      {/* PROYECCION DE CAMPEON */}
      <section>
        <SectionTitle index="01">Proyeccion de campeon</SectionTitle>
        <div className="card divide-y divide-ink-800">
          {topContenders.map((c, i) => (
            <div
              key={c.team.id}
              className="grid grid-cols-[2rem_2rem_1fr_auto] items-center gap-3 px-4 py-3"
            >
              <span className="stat-num text-sm text-ink-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Flag teamId={c.team.id} size={40} className="h-4" />
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-white">
                    {c.team.name}
                  </span>
                  <span className="stat-num text-sm text-accent">
                    {pctRaw(c.pct)}
                  </span>
                </div>
                <ProbBar value={(c.pct / maxPct)} />
              </div>
              <span className="label hidden sm:block">#{c.team.fifaRank}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BOTA DE ORO */}
      <section>
        <SectionTitle index="02">Bota de Oro · goleadores proyectados</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.goldenBoot.slice(0, 8).map((s, i) => (
            <div
              key={s.name}
              className="card flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="stat-num text-sm text-ink-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm text-white">{s.name}</p>
                  <p className="label">{s.teamName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="stat-num text-lg text-accent">
                  {s.avgGoals.toFixed(1)}
                </p>
                <p className="label">goles prom.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACCESOS */}
      <section className="grid gap-3 sm:grid-cols-3">
        <NavCard href="/grupos" index="03" title="Grupos" desc="Clasificacion proyectada de los 12 grupos." />
        <NavCard href="/partidos" index="04" title="Partidos" desc="Los 72 partidos con todos los mercados." />
        <NavCard href="/campeon" index="05" title="Camino al titulo" desc="Finalistas y favoritos al trofeo." />
      </section>
    </div>
  );
}

function NavCard({
  href,
  index,
  title,
  desc,
}: {
  href: string;
  index: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card card-interactive group p-5 hover:border-accent"
    >
      <p className="font-mono text-xs text-accent">{index}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-white group-hover:text-accent">
        {title}
      </p>
      <p className="mt-1 text-sm text-ink-500">{desc}</p>
    </Link>
  );
}
