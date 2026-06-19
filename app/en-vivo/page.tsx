import { fetchWorldCupLive, statusInfo, type LiveMatch } from "@/lib/data/live";
import { displayTeamName } from "@/lib/data/team-resolver";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "En vivo · Mundial 2026 IA Predictor",
};

// Datos reales: revalida cada 24h (cuida el limite de 100 peticiones/dia del plan Free).
export const revalidate = 86400;

export default async function EnVivoPage() {
  const data = await fetchWorldCupLive();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tightest">
          En vivo · datos reales
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Partidos reales del Mundial 2026 (ayer, hoy y manana) directo de
          API-Football. Resultados y estado en tiempo real.
        </p>
      </div>

      {!data.configured && (
        <Notice>
          No hay API key configurada. Agrega <code>API_FOOTBALL_KEY</code> en las
          variables de entorno de Vercel para ver datos reales.
        </Notice>
      )}

      {data.configured && data.error && (
        <Notice tone="error">
          Error al consultar API-Football: {data.error}
        </Notice>
      )}

      {data.configured && !data.error && data.matches.length === 0 && (
        <Notice>
          No hay partidos del Mundial entre {data.dates[0]} y{" "}
          {data.dates[data.dates.length - 1]}. Puede ser dia de descanso o que
          aun no esten cargados los fixtures. Esta vista muestra solo hoy +-1
          dia (limite del plan Free).
        </Notice>
      )}

      {data.matches.length > 0 && (
        <section>
          <SectionTitle index="LIVE">
            {data.matches.length} partidos · {data.dates[0]} a{" "}
            {data.dates[data.dates.length - 1]}
          </SectionTitle>
          <div className="grid gap-3">
            {data.matches.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchRow({ m }: { m: LiveMatch }) {
  const s = statusInfo(m);
  const time = new Date(m.dateISO).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="label truncate">{m.round}</span>
        <span
          className={`font-mono text-[10px] uppercase tracking-wider ${
            s.live ? "text-signal-loss" : s.done ? "text-signal-win" : "text-ink-500"
          }`}
        >
          {s.live && (
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-signal-loss align-middle" />
          )}
          {s.label}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <TeamCol name={displayTeamName(m.home.name)} logo={m.home.logo} align="left" />

        <div className="text-center">
          {s.done || s.live ? (
            <p className="stat-num text-3xl text-white">
              {m.home.goals ?? 0}
              <span className="mx-2 text-ink-600">-</span>
              {m.away.goals ?? 0}
            </p>
          ) : (
            <p className="font-mono text-xs text-ink-500">vs</p>
          )}
          <p className="mt-1 label">{time}</p>
        </div>

        <TeamCol name={displayTeamName(m.away.name)} logo={m.away.logo} align="right" />
      </div>

      {m.venue && (
        <p className="mt-3 text-center label">{m.venue}</p>
      )}
    </div>
  );
}

function TeamCol({
  name,
  logo,
  align,
}: {
  name: string;
  logo: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={28} height={28} className="h-7 w-7 object-contain" loading="lazy" />
      ) : (
        <span className="h-7 w-7 bg-ink-700" />
      )}
      <span className="text-sm font-medium text-white">{name}</span>
    </div>
  );
}

function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div
      className={`card p-5 text-sm ${
        tone === "error" ? "border-signal-loss/50 text-signal-loss" : "text-ink-500"
      }`}
    >
      {children}
    </div>
  );
}
