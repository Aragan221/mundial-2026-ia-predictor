import { notFound } from "next/navigation";
import Link from "next/link";
import { FIXTURES } from "@/lib/data/fixtures";
import { predictById } from "@/lib/model/predict";
import { Flag } from "@/components/flag";
import { SectionTitle, MarketRow, BigStat, ConfidenceTag } from "@/components/ui";
import { pct, dateLabel, timeLabel } from "@/lib/format";

export function generateStaticParams() {
  return FIXTURES.map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = predictById(id);
  if (!p) return { title: "Partido no encontrado" };
  return { title: `${p.home.name} vs ${p.away.name} · Mundial 2026 IA` };
}

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = predictById(id);
  if (!p) notFound();

  const m = p.markets;
  const fav =
    m.homeWin >= m.draw && m.homeWin >= m.awayWin
      ? "home"
      : m.awayWin >= m.draw
        ? "away"
        : "draw";

  return (
    <div className="space-y-10">
      <Link href="/partidos" className="label hover:text-accent">
        ← Volver a partidos
      </Link>

      {/* CABECERA */}
      <section className="border border-ink-700 bg-ink-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="label">
            Grupo {p.fixture.group} · {dateLabel(p.fixture.date)}{" "}
            {timeLabel(p.fixture.date)}
          </span>
          <ConfidenceTag value={p.confidence} />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <TeamSide teamId={p.home.id} name={p.home.name} align="left" win={m.homeWin} />
          <div className="text-center">
            <p className="label mb-1">Goles esperados</p>
            <p className="stat-num text-3xl text-white">
              {m.lambdaHome.toFixed(1)}
              <span className="mx-2 text-ink-600">-</span>
              {m.lambdaAway.toFixed(1)}
            </p>
            <p className="mt-1 label">{p.fixture.venue}</p>
          </div>
          <TeamSide teamId={p.away.id} name={p.away.name} align="right" win={m.awayWin} />
        </div>
      </section>

      {/* 1X2 + DOBLE OPORTUNIDAD */}
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <SectionTitle index="1X2">Resultado del partido</SectionTitle>
          <MarketRow label={`Gana ${p.home.name}`} value={m.homeWin} highlight={fav === "home"} />
          <MarketRow label="Empate" value={m.draw} highlight={fav === "draw"} color="bg-signal-draw" />
          <MarketRow label={`Gana ${p.away.name}`} value={m.awayWin} highlight={fav === "away"} />
        </div>
        <div>
          <SectionTitle index="DC">Doble oportunidad</SectionTitle>
          <MarketRow label="1X (local o empate)" value={m.homeOrDraw} />
          <MarketRow label="12 (sin empate)" value={m.homeOrAway} />
          <MarketRow label="X2 (visitante o empate)" value={m.drawOrAway} />
        </div>
      </section>

      {/* GOLES */}
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <SectionTitle index="OU">Over / Under goles</SectionTitle>
          <MarketRow label="Mas de 1.5 goles" value={m.over15} />
          <MarketRow label="Mas de 2.5 goles" value={m.over25} highlight />
          <MarketRow label="Mas de 3.5 goles" value={m.over35} />
        </div>
        <div>
          <SectionTitle index="BTTS">Ambos marcan y porteria a cero</SectionTitle>
          <MarketRow label="Ambos marcan (BTTS)" value={m.bttsYes} highlight />
          <MarketRow label={`${p.home.name} deja porteria a cero`} value={m.homeCleanSheet} color="bg-signal-win" />
          <MarketRow label={`${p.away.name} deja porteria a cero`} value={m.awayCleanSheet} color="bg-signal-win" />
        </div>
      </section>

      {/* MARCADOR EXACTO */}
      <section>
        <SectionTitle index="CS">Marcador exacto · top 5</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {m.topScores.map((s, i) => (
            <div key={`${s.home}-${s.away}`} className="card p-4 text-center">
              <p className="label mb-2">#{i + 1}</p>
              <p className="stat-num text-2xl text-white">
                {s.home}-{s.away}
              </p>
              <p className="mt-1 stat-num text-sm text-accent">{pct(s.prob)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TARJETAS Y CORNERS */}
      <section>
        <SectionTitle index="DISC">Tarjetas y corners</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BigStat label="Tarjetas esperadas" value={m.cardsExpected.toFixed(1)} sub="amarillas + rojas" />
          <BigStat label="Mas de 3.5 tarjetas" value={pct(m.cardsOver35)} sub="probabilidad" />
          <BigStat label="Roja en el partido" value={pct(m.redCardProb)} sub="al menos una" />
          <BigStat
            label={`Corners O${m.cornersLine}`}
            value={pct(m.cornersOverLine)}
            sub={`~${m.cornersExpected} esperados`}
          />
        </div>
      </section>

      {/* GOLEADORES */}
      <section>
        <SectionTitle index="SCR">Goleador en cualquier momento</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {m.scorers.map((s) => {
            const team = s.team === "home" ? p.home : p.away;
            return (
              <div key={s.name} className="card flex items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-white">
                  <Flag teamId={team.id} size={20} className="h-3" />
                  {s.name}
                </span>
                <span className="stat-num text-sm text-accent">
                  {pct(s.anytime)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="label">
        Generado por el modelo Poisson el{" "}
        {new Date(p.generatedAt).toLocaleString("es-ES")}.
      </p>
    </div>
  );
}

function TeamSide({
  teamId,
  name,
  align,
  win,
}: {
  teamId: string;
  name: string;
  align: "left" | "right";
  win: number;
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className={`flex items-center gap-3 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <Flag teamId={teamId} size={80} className="h-9" />
        <div className={align === "right" ? "text-right" : "text-left"}>
          <p className="text-lg font-semibold leading-tight text-white">
            {name}
          </p>
          <p className="stat-num text-sm text-accent">{pct(win)}</p>
        </div>
      </div>
    </div>
  );
}
