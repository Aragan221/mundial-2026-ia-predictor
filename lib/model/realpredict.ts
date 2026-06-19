import type { Fixture } from "@/lib/model/types";
import { expectedGoals, scoreMatrix, deriveMarkets } from "@/lib/model/poisson";
import { cardsMarket } from "@/lib/model/cards";
import { cornersMarket } from "@/lib/model/corners";
import { resolveTeam } from "@/lib/data/team-resolver";

// ===========================================================================
// Prediccion del modelo Poisson aplicada a un partido REAL (por nombres).
// Devuelve la mejor apuesta, un set amplio de mercados y una COMBINADA DEL
// MISMO PARTIDO (same-game) con probabilidad conjunta correcta:
//   - Mercados de marcador (1X2, goles, handicap) se combinan sumando la
//     matriz de marcadores (estan correlacionados).
//   - Tarjetas y corners son independientes y se multiplican.
// ===========================================================================

export interface Pick {
  code: string;
  label: string;
  prob: number;
}

export interface ExtraMarkets {
  expectedGoals: number;
  topScore: { home: number; away: number; prob: number };
  handicap: Pick;
  under35: number;
  cardsExpected: number;
  cardsOver35: number;
  cornersExpected: number;
  cornersLine: number;
  cornersOver: number;
}

export interface SameGameCombo {
  legs: Pick[]; // probabilidad marginal de cada seleccion (para mostrar)
  prob: number; // probabilidad CONJUNTA de que se cumplan todas
  odds: number; // cuota justa = 1 / prob
}

export interface RealMatchPrediction {
  homeName: string;
  awayName: string;
  known: boolean;
  lambdaHome: number;
  lambdaAway: number;
  picks: Pick[];
  bestPick: Pick;
  goalsPick: Pick;
  scorePick: Pick;
  extra: ExtraMarkets;
  sameGame: SameGameCombo;
  raw: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
    bttsYes: number;
  };
}

type ScorePred = (h: number, a: number) => boolean;

function jointScoreProb(matrix: number[][], preds: ScorePred[]): number {
  let s = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      if (preds.every((p) => p(h, a))) s += matrix[h][a];
    }
  }
  return s;
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

  // --- Combinada del mismo partido (same-game) ---
  // Leg 1: doble oportunidad del favorito (mercado de marcador).
  const dcLeg: Pick = homeFav
    ? { code: "1X", label: `${homeName} o empate`, prob: d.homeWin + d.draw }
    : { code: "X2", label: `Empate o ${awayName}`, prob: d.draw + d.awayWin };
  const dcPred: ScorePred = homeFav ? (gh, ga) => gh >= ga : (gh, ga) => ga >= gh;

  // Leg 2: linea de goles mas probable (Over 1.5 vs Under 3.5), de marcador.
  const useOver = d.over15 >= 1 - d.over35;
  const goalsLeg: Pick = useOver
    ? { code: "O1.5", label: "Mas de 1.5 goles", prob: d.over15 }
    : { code: "U3.5", label: "Menos de 3.5 goles", prob: 1 - d.over35 };
  const goalsPred: ScorePred = useOver
    ? (gh, ga) => gh + ga >= 2
    : (gh, ga) => gh + ga <= 3;

  // Leg 3: estadistica independiente (corners o tarjetas, la mas probable).
  const thirdLeg: Pick =
    corners.overLine >= cards.over35
      ? { code: `C+${corners.line}`, label: `Mas de ${corners.line} corners`, prob: corners.overLine }
      : { code: "T+3.5", label: "Mas de 3.5 tarjetas", prob: cards.over35 };

  // Probabilidad conjunta: marcador (correlacionado, via matriz) x independiente.
  const scorelineJoint = jointScoreProb(matrix, [dcPred, goalsPred]);
  const comboProb = scorelineJoint * thirdLeg.prob;

  const sameGame: SameGameCombo = {
    legs: [dcLeg, goalsLeg, thirdLeg],
    prob: comboProb,
    odds: comboProb > 0 ? 1 / comboProb : 0,
  };

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
    sameGame,
    raw: {
      homeWin: d.homeWin,
      draw: d.draw,
      awayWin: d.awayWin,
      over25: d.over25,
      under25: 1 - d.over25,
      bttsYes: d.bttsYes,
    },
  };
}
