import type { Fixture } from "@/lib/model/types";
import { expectedGoals, scoreMatrix, deriveMarkets } from "@/lib/model/poisson";
import { cardsMarket } from "@/lib/model/cards";
import { cornersMarket } from "@/lib/model/corners";
import { resolveTeam } from "@/lib/data/team-resolver";

// ===========================================================================
// Prediccion del modelo Poisson aplicada a un partido REAL (por nombres).
// Devuelve la mejor apuesta (pick mas probable) y un set amplio de mercados:
// 1X2, doble oportunidad, over/under, BTTS, marcador exacto, handicap,
// tarjetas y corners.
// ===========================================================================

export interface Pick {
  code: string;
  label: string;
  prob: number;
}

export interface ExtraMarkets {
  expectedGoals: number;
  topScore: { home: number; away: number; prob: number };
  handicap: Pick; // favorito -1.5
  under35: number;
  cardsExpected: number;
  cardsOver35: number;
  cornersExpected: number;
  cornersLine: number;
  cornersOver: number;
}

export interface RealMatchPrediction {
  homeName: string;
  awayName: string;
  known: boolean;
  lambdaHome: number;
  lambdaAway: number;
  picks: Pick[];
  bestPick: Pick;
  goalsPick: Pick; // siempre "Mas de 1.5 goles" (para parley de goles)
  scorePick: Pick; // marcador exacto mas probable (para parley de marcadores)
  extra: ExtraMarkets;
}

export function predictReal(
  homeName: string,
  awayName: string,
): RealMatchPrediction {
  const h = resolveTeam(homeName);
  const a = resolveTeam(awayName);

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
  const matrix = scoreMatrix(lambda);
  const d = deriveMarkets(matrix);
  const cards = cardsMarket(h.team, a.team);
  const corners = cornersMarket(h.team, a.team, lambda);

  // Handicap -1.5 del favorito (gana por 2 o mas goles).
  let homeBy2 = 0;
  let awayBy2 = 0;
  for (let gh = 0; gh < matrix.length; gh++) {
    for (let ga = 0; ga < matrix[gh].length; ga++) {
      if (gh - ga >= 2) homeBy2 += matrix[gh][ga];
      if (ga - gh >= 2) awayBy2 += matrix[gh][ga];
    }
  }
  const homeFav = d.homeWin >= d.awayWin;
  const handicap: Pick = {
    code: "H-1.5",
    label: `${homeFav ? homeName : awayName} -1.5`,
    prob: homeFav ? homeBy2 : awayBy2,
  };

  const top = d.topScores[0];

  // Candidatos "seguros" para la mejor apuesta del partido.
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
    goalsPick: { code: "O1.5", label: "Mas de 1.5 goles", prob: d.over15 },
    scorePick: {
      code: "CS",
      label: `Marcador ${top.home}-${top.away}`,
      prob: top.prob,
    },
    extra: {
      expectedGoals: lambda.home + lambda.away,
      topScore: top,
      handicap,
      under35: 1 - d.over35,
      cardsExpected: cards.expected,
      cardsOver35: cards.over35,
      cornersExpected: corners.expected,
      cornersLine: corners.line,
      cornersOver: corners.overLine,
    },
  };
}
