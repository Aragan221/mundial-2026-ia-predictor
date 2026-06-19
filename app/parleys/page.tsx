import { fetchWorldCupLive, statusInfo } from "@/lib/data/live";
import { buildParlays, type ParlayLeg, type Parlay } from "@/lib/model/parlays";
import { SectionTitle, ProbBar } from "@/components/ui";
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

export default async function ParleysPage() {
  const data = await fetchWorldCupLive();

  const upcoming = data.matches
    .filter((m) => {
      const s = statusInfo(m);
      return !s.live && !s.done;
    })
    .map((m) => ({
      homeName: m.home.name,
      awayName: m.away.name,
      homeLogo: m.home.logo,
      awayLogo: m.away.logo,
    }));

  const { legs, parlays } = buildParlays(upcoming);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">
          Parleys mas probables
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          El modelo Poisson analiza los proximos partidos reales del Mundial,
          calcula todos los mercados y arma combinadas ordenadas por
          probabilidad.
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

      {parlays.length > 0 && (
        <section>
          <SectionTitle index="01">Combinadas sugeridas</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-3">
            {parlays.map((p) => (
              <ParlayCard key={p.name} parlay={p} />
            ))}
          </div>
        </section>
      )}

      {legs.length > 0 && (
        <section>
          <SectionTitle index="02">
            Analisis completo · partido por partido
          </SectionTitle>
          <div className="space-y-3">
            {legs.map((leg, i) => (
              <LegCard key={`${leg.homeName}-${leg.awayName}`} i={i} leg={leg} />
            ))}
          </div>
        </section>
      )}

      <p className="label">
        Probabilidades del modelo estadistico. La cuota mostrada es la cuota
        justa implicita (1 / probabilidad), solo de referencia. Analisis de
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

function LegCard({ i, leg }: { i: number; leg: ParlayLeg }) {
  const e = leg.extra;
  return (
    <div className="card p-4">
      <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-4">
        <span className="stat-num text-sm text-ink-500">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-white">
            {leg.homeName} <span className="text-ink-600">vs</span>{" "}
            {leg.awayName}
            {!leg.known && (
              <span className="ml-2 align-middle font-mono text-[9px] uppercase tracking-wider text-ink-500">
                rating estimado
              </span>
            )}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
              {leg.pick.code}
            </span>
            <span className="truncate text-xs text-ink-500">
              {leg.pick.label}
            </span>
          </div>
          <div className="mt-1.5 max-w-xs">
            <ProbBar value={leg.pick.prob} />
          </div>
        </div>
        <div className="text-right">
          <p className="stat-num text-lg text-white">{pct(leg.pick.prob)}</p>
          <p className="label">cuota {leg.odds.toFixed(2)}</p>
        </div>
      </div>

      {/* Mercados adicionales */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-800 pt-3 sm:grid-cols-4">
        <Chip label="Marcador probable" value={`${e.topScore.home}-${e.topScore.away}`} sub={pct(e.topScore.prob)} />
        <Chip label={e.handicap.label} value={pct(e.handicap.prob)} sub="handicap" />
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
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-ink-800/50 px-3 py-2">
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
