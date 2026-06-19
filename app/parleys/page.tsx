import { fetchWorldCupLive, statusInfo, type LiveMatch } from "@/lib/data/live";
import {
  buildParlays,
  type ParlayLeg,
  type Parlay,
  type UpcomingMatch,
} from "@/lib/model/parlays";
import { SectionTitle } from "@/components/ui";
import { pct } from "@/lib/format";

export const metadata = {
  title: "Parleys · Mundial 2026 IA Predictor",
};

export const revalidate = 120;

const KIND_ACCENT: Record<Parlay["kind"], string> = {
  safe: "text-signal-win",
  balanced: "text-accent",
  risky: "text-signal-draw",
  goals: "text-accent",
  score: "text-signal-loss",
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function dayLabel(key: string): { tag: string; date: string } {
  const today = new Date();
  const t = today.toISOString().slice(0, 10);
  const tom = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
  const yes = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

  let tag = "";
  if (key === t) tag = "HOY";
  else if (key === tom) tag = "MANANA";
  else if (key === yes) tag = "AYER";

  const date = new Date(`${key}T12:00:00Z`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return { tag, date };
}

export default async function ParleysPage() {
  const data = await fetchWorldCupLive();

  const upcoming = data.matches.filter((m) => {
    const s = statusInfo(m);
    return !s.live && !s.done;
  });

  // Agrupa los partidos por dia.
  const groups = new Map<string, LiveMatch[]>();
  for (const m of upcoming) {
    const k = dayKey(m.dateISO);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(m);
  }
  const days = [...groups.keys()].sort();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">
          Parleys por dia
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Combinadas del dia y, para cada partido, una combinada propia
          (same-game) con probabilidad conjunta real: resultado, goles y una
          estadistica (corners o tarjetas).
        </p>
      </div>

      {!data.configured && (
        <Notice>
          Falta la API key (<code>API_FOOTBALL_KEY</code>) para traer los
          partidos reales.
        </Notice>
      )}

      {data.configured && upcoming.length === 0 && (
        <Notice>
          No hay partidos proximos en la ventana de hoy +-1 dia (limite del plan
          Free). Vuelve cuando haya partidos programados.
        </Notice>
      )}

      {days.map((key) => {
        const matches = groups.get(key)!;
        const upcomingMatches: UpcomingMatch[] = matches.map((m) => ({
          homeName: m.home.name,
          awayName: m.away.name,
          homeLogo: m.home.logo,
          awayLogo: m.away.logo,
        }));
        const { legs, parlays } = buildParlays(upcomingMatches);
        const { tag, date } = dayLabel(key);

        return (
          <section key={key} className="space-y-6">
            <div className="flex items-baseline gap-3 border-b border-ink-700 pb-2">
              {tag && (
                <span className="bg-accent px-2 py-0.5 font-mono text-xs font-bold text-ink-950">
                  {tag}
                </span>
              )}
              <h2 className="font-mono text-sm uppercase tracking-wider text-white">
                {date}
              </h2>
              <span className="label">{matches.length} partidos</span>
            </div>

            {parlays.length > 0 && (
              <div>
                <SectionTitle>Combinadas del dia</SectionTitle>
                <div className="grid gap-4 lg:grid-cols-3">
                  {parlays.slice(0, 3).map((p) => (
                    <ParlayCard key={p.name} parlay={p} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <SectionTitle>Combinada por partido (same-game)</SectionTitle>
              <div className="space-y-3">
                {legs.map((leg) => (
                  <LegCard key={`${leg.homeName}-${leg.awayName}`} leg={leg} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <p className="label">
        Probabilidades del modelo estadistico. La combinada del partido usa la
        probabilidad conjunta real (marcador correlacionado + estadistica
        independiente). Cuota justa = 1 / probabilidad. Analisis de
        entretenimiento, no es asesoria de apuestas.
      </p>
    </div>
  );
}

function ParlayCard({ parlay }: { parlay: Parlay }) {
  return (
    <div className="card flex flex-col p-5">
      <h3
        className={`mb-4 font-mono text-xs uppercase tracking-wider ${KIND_ACCENT[parlay.kind]}`}
      >
        {parlay.name}
      </h3>

      <div className="flex-1 space-y-3">
        {parlay.legs.map((leg) => (
          <div key={`${leg.homeName}-${leg.awayName}`} className="text-sm">
            <p className="text-ink-500">
              {leg.homeName} <span className="text-ink-600">vs</span>{" "}
              {leg.awayName}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white">{leg.pick.label}</span>
              <span className="stat-num text-accent">{pct(leg.pick.prob)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-ink-700 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="label">Prob. combinada</p>
            <p className="stat-num text-2xl text-white">
              {pct(parlay.combinedProb)}
            </p>
          </div>
          <div className="text-right">
            <p className="label">Cuota justa</p>
            <p className="stat-num text-2xl text-accent">
              {parlay.combinedOdds.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegCard({ leg }: { leg: ParlayLeg }) {
  const e = leg.extra;
  const sg = leg.sameGame;
  return (
    <div className="card p-4">
      {/* Cabecera del partido */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          {leg.homeLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={leg.homeLogo} alt="" width={20} height={20} className="h-5 w-5 object-contain" loading="lazy" />
          )}
          <span className="truncate text-sm font-medium text-white">
            {leg.homeName} <span className="text-ink-600">vs</span> {leg.awayName}
          </span>
          {leg.awayLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={leg.awayLogo} alt="" width={20} height={20} className="h-5 w-5 object-contain" loading="lazy" />
          )}
          {!leg.known && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
              rating estimado
            </span>
          )}
        </div>
      </div>

      {/* Combinada del partido (same-game) */}
      <div className="mt-3 border border-accent/30 bg-accent/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
            Combinada del partido
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            cuota {sg.odds.toFixed(2)}
          </span>
        </div>
        <div className="space-y-1.5">
          {sg.legs.map((l) => (
            <div key={l.code} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 truncate text-white">
                <span className="font-mono text-[10px] uppercase text-accent">
                  {l.code}
                </span>
                <span className="truncate text-ink-500">{l.label}</span>
              </span>
              <span className="stat-num text-white">{pct(l.prob)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-accent/20 pt-2">
          <span className="label">Prob. conjunta</span>
          <span className="stat-num text-lg text-accent">{pct(sg.prob)}</span>
        </div>
      </div>

      {/* Mercados individuales */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Chip label="Mejor apuesta" value={leg.pick.code} sub={pct(leg.pick.prob)} highlight />
        <Chip label="Marcador" value={`${e.topScore.home}-${e.topScore.away}`} sub={pct(e.topScore.prob)} />
        <Chip label={e.handicap.label} value={pct(e.handicap.prob)} sub="hand." />
        <Chip label="+3.5 tarjetas" value={pct(e.cardsOver35)} sub={`~${e.cardsExpected}`} />
        <Chip label={`Corners O${e.cornersLine}`} value={pct(e.cornersOver)} sub={`~${e.cornersExpected}`} />
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`px-3 py-2 ${highlight ? "bg-accent/10" : "bg-ink-800/50"}`}>
      <p className="label truncate">{label}</p>
      <p className="stat-num text-sm text-white">
        {value} <span className="text-ink-600">{sub}</span>
      </p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="card p-5 text-sm text-ink-500">{children}</div>;
}
