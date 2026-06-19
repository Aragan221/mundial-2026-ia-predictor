import { fetchWorldCupLive, statusInfo } from "@/lib/data/live";
import { fetchOddsForFixtures } from "@/lib/data/odds";
import { computeValue, type ValueMatch } from "@/lib/model/value";
import { SectionTitle } from "@/components/ui";
import { pct } from "@/lib/format";

export const metadata = {
  title: "Valor · IA vs casas · Mundial 2026",
};

export const revalidate = 86400;

export default async function ValorPage() {
  const data = await fetchWorldCupLive();

  // Partidos proximos (no empezados) con sus ids para pedir cuotas.
  const upcoming: ValueMatch[] = data.matches
    .filter((m) => {
      const s = statusInfo(m);
      return !s.live && !s.done;
    })
    .map((m) => ({
      id: m.id,
      homeName: m.home.name,
      awayName: m.away.name,
      kickoff: m.dateISO,
    }));

  const oddsMap = await fetchOddsForFixtures(upcoming.map((m) => m.id));
  const allOpps = computeValue(upcoming, oddsMap);
  const valueOpps = allOpps.filter((o) => o.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">IA vs mercado · valor esperado</p>
        <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
          Donde la IA ve valor
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Mercados donde el modelo da mas probabilidad de la que paga la cuota
          real de las casas. {valueOpps.length} oportunidades.
        </p>
      </div>

      {!data.configured && (
        <Notice>
          Falta la API key para traer partidos y cuotas reales.
        </Notice>
      )}

      {data.configured && oddsMap.size === 0 && (
        <Notice>
          No hay cuotas disponibles ahora mismo para los partidos de la ventana
          (hoy +-1 dia). Las casas publican cuotas entre 1 y 14 dias antes; en el
          plan Free solo vemos hoy +-1.
        </Notice>
      )}

      {valueOpps.length > 0 && (
        <section>
          <SectionTitle index="01">Oportunidades de valor</SectionTitle>
          <div className="card divide-y divide-ink-800">
            {valueOpps.map((o, i) => (
              <div
                key={`${o.homeName}-${o.market}-${i}`}
                className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-4 py-3"
              >
                <span className="stat-num text-sm text-ink-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="label truncate">
                    {o.homeName} vs {o.awayName} ·{" "}
                    {new Date(o.kickoff).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm font-medium text-white">{o.market}</p>
                  <p className="label mt-0.5">
                    IA {pct(o.modelProb)} · cuota {o.odd.toFixed(2)}
                  </p>
                </div>
                <span className="bg-signal-win px-2 py-1 font-mono text-sm font-bold text-ink-950">
                  +{Math.round(o.value * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.configured && oddsMap.size > 0 && valueOpps.length === 0 && (
        <Notice>
          Ahora mismo el modelo no encuentra valor positivo en los partidos con
          cuotas disponibles. Significa que las casas estan rankeando estos
          mercados igual o mejor que el modelo. Vuelve manana.
        </Notice>
      )}

      <p className="label">
        Valor = probabilidad del modelo x cuota - 1. Cuota mediana de las casas
        (con su margen). Se omiten cuotas mayores a 6 para evitar falsos
        positivos. Analisis estadistico de entretenimiento, no es asesoria de
        apuestas.
      </p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="card p-5 text-sm text-ink-500">{children}</div>;
}
