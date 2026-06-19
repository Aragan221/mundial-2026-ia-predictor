import type { Fixture } from "@/lib/model/types";
import { expectedGoals, scoreMatrix, deriveMarkets } from "@/lib/model/poisson";
import { resolveTeam } from "@/lib/data/team-resolver";

// ===========================================================================
// Prediccion del modelo Poisson aplicada a un partido REAL (por nombres).
// Devuelve los mercados y, sobre todo, la "mejor apuesta" (pick mas probable).
// ===========================================================================

export interface Pick {
  code: string;
  label: string;
  prob: number;
}

export interface RealMatchPrediction {
  homeName: string;
  awayName: string;
  known: boolean;
  lambdaHome: number;
  lambdaAway: number;
  picks: Pick[];
  bestPick: Pick;
}

export function predictReal(
  homeName: string,
  awayName: string,
): RealMatchPrediction {
  const h = resolveTeam(homeName);
  const a = resolveTeam(awayName);

  // Mundial: sede neutral (salvo anfitriones, pero lo dejamos neutral aqui).
  const fixture: Fixture = {
    id: "real",
    stage: "Grupos",
    date: new Date().toISOString(),
    homeId: h.team.id,
    awayId: a.team.id,
    venue: "",
    neutral: true,
  };
  const lambda = expectedGoals(h.team, a.team, fixture);
  const d = deriveMarkets(scoreMatrix(lambda));

  // Candidatos de apuesta (mercados interesantes, sin triviales tipo +0.5).
  const picks: Pick[] = [
    { code: "1", label: `Gana ${homeName}`, prob: d.homeWin },
    { code: "2", label: `Gana ${awayName}`, prob: d.awayWin },
    { code: "1X", label: `${homeName} o empate`, prob: d.homeWin + d.draw },
    { code: "X2", label: `Empate o ${awayName}`, prob: d.draw + d.awayWin },
    { code: "O1.5", label: "Mas de 1.5 goles", prob: d.over15 },
    { code: "O2.5", label: "Mas de 2.5 goles", prob: d.over25 },
    { code: "BTTS", label: "Ambos marcan", prob: d.bttsYes },
  ];

  const bestPick = picks.reduce(
    (best, p) => (p.prob > best.prob ? p : best),
    picks[0],
  );

  return {
    homeName,
    awayName,
    known: h.known && a.known,
    lambdaHome: lambda.home,
    lambdaAway: lambda.away,
    picks,
    bestPick,
  };
}
