import {
  predictReal,
  type Pick,
  type ExtraMarkets,
  type SameGameCombo,
} from "@/lib/model/realpredict";

// ===========================================================================
// Construye parleys (apuestas combinadas) a partir de los partidos proximos.
// Ademas de la combinada "segura" (mejor apuesta de cada partido), arma
// parleys tematicos: de goles (Over 1.5) y de marcadores exactos.
// Probabilidad combinada = producto; cuota implicita = 1 / prob.
// ===========================================================================

export interface ParlayLeg {
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
  pick: Pick;
  odds: number;
  known: boolean;
  extra: ExtraMarkets;
  sameGame: SameGameCombo;
}

export interface Parlay {
  name: string;
  kind: "safe" | "balanced" | "risky" | "goals" | "score";
  legs: { homeName: string; awayName: string; pick: Pick }[];
  combinedProb: number;
  combinedOdds: number;
}

export interface ParlaysResult {
  legs: ParlayLeg[];
  parlays: Parlay[];
}

export interface UpcomingMatch {
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
}

function combine(
  name: string,
  kind: Parlay["kind"],
  source: { homeName: string; awayName: string; pick: Pick }[],
  n: number,
): Parlay {
  const sel = source.slice(0, n);
  const combinedProb = sel.reduce((p, l) => p * l.pick.prob, 1);
  return {
    name,
    kind,
    legs: sel,
    combinedProb,
    combinedOdds: combinedProb > 0 ? 1 / combinedProb : 0,
  };
}

export function buildParlays(matches: UpcomingMatch[]): ParlaysResult {
  const preds = matches.map((m) => ({ m, pred: predictReal(m.homeName, m.awayName) }));

  // Legs principales: la mejor apuesta de cada partido (ordenadas por prob).
  const legs: ParlayLeg[] = preds
    .map(({ m, pred }) => ({
      homeName: m.homeName,
      awayName: m.awayName,
      homeLogo: m.homeLogo,
      awayLogo: m.awayLogo,
      pick: pred.bestPick,
      odds: pred.bestPick.prob > 0 ? 1 / pred.bestPick.prob : 0,
      known: pred.known,
      extra: pred.extra,
      sameGame: pred.sameGame,
    }))
    .sort((a, b) => b.pick.prob - a.pick.prob);

  const bestSource = legs.map((l) => ({
    homeName: l.homeName,
    awayName: l.awayName,
    pick: l.pick,
  }));

  // Fuente para parley de goles (Over 1.5), ordenado por probabilidad.
  const goalsSource = preds
    .map(({ m, pred }) => ({
      homeName: m.homeName,
      awayName: m.awayName,
      pick: pred.goalsPick,
    }))
    .sort((a, b) => b.pick.prob - a.pick.prob);

  // Fuente para parley de marcadores exactos (mas arriesgado, mayor cuota).
  const scoreSource = preds
    .map(({ m, pred }) => ({
      homeName: m.homeName,
      awayName: m.awayName,
      pick: pred.scorePick,
    }))
    .sort((a, b) => b.pick.prob - a.pick.prob);

  const parlays: Parlay[] = [];
  if (bestSource.length >= 2) parlays.push(combine("Parley seguro · 2 selecciones", "safe", bestSource, 2));
  if (bestSource.length >= 3) parlays.push(combine("Parley equilibrado · 3 selecciones", "balanced", bestSource, 3));
  if (bestSource.length >= 4) parlays.push(combine("Parley arriesgado · 4 selecciones", "risky", bestSource, 4));
  if (goalsSource.length >= 3) parlays.push(combine("Parley de goles · Over 1.5", "goals", goalsSource, 3));
  if (scoreSource.length >= 2) parlays.push(combine("Parley de marcadores · alto riesgo", "score", scoreSource, 2));

  return { legs, parlays };
}
