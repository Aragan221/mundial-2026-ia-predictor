import type { Team } from "@/lib/model/types";
import { poisson } from "@/lib/model/poisson";

// ===========================================================================
// Tarjetas: regresion sencilla sobre el promedio historico de cada equipo,
// ajustada por la intensidad del partido (rivales parejos = mas tension).
// Poisson es mas ruidoso aqui que en goles, por eso la confianza es menor.
// ===========================================================================

export interface CardsMarket {
  expected: number;
  over35: number;
  redCardProb: number;
}

export function cardsMarket(home: Team, away: Team): CardsMarket {
  const base = home.cardsAvg + away.cardsAvg;

  // Intensidad: partidos entre equipos de ranking parecido tienden a calentarse.
  const rankGap = Math.abs(home.fifaRank - away.fifaRank);
  const intensity = 1 + Math.max(0, (25 - rankGap)) * 0.004; // hasta +10%

  const expected = base * intensity;

  // Probabilidad de superar 3.5 tarjetas (Poisson sobre el total esperado).
  let cumLowOrEq = 0;
  for (let k = 0; k <= 3; k++) cumLowOrEq += poisson(k, expected);
  const over35 = 1 - cumLowOrEq;

  // Probabilidad de al menos una roja, escala con la intensidad.
  const redCardProb = Math.min(0.45, 0.08 + (intensity - 1) * 1.6);

  return {
    expected: round1(expected),
    over35: clamp01(over35),
    redCardProb: clamp01(redCardProb),
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
