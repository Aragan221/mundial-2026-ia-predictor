import type { Team } from "@/lib/model/types";
import type { Lambdas } from "@/lib/model/poisson";
import { poisson } from "@/lib/model/poisson";

// ===========================================================================
// Corners: promedio historico de cada equipo escalado por el dominio ofensivo
// proyectado (mas goles esperados -> mas llegadas -> mas corners). La linea
// over/under se elige dinamicamente alrededor del valor esperado.
// ===========================================================================

export interface CornersMarket {
  expected: number;
  line: number;
  overLine: number;
}

export function cornersMarket(
  home: Team,
  away: Team,
  lambda: Lambdas,
): CornersMarket {
  const base = home.cornersAvg + away.cornersAvg;

  // Cuanto mas se espera atacar, mas corners. Normalizamos sobre ~2.7 goles.
  const attackPressure = (lambda.home + lambda.away) / 2.7;
  const expected = base * (0.85 + 0.15 * attackPressure);

  // Linea dinamica: medio punto por debajo del entero mas cercano al esperado.
  const line = Math.round(expected) - 0.5;

  // P(corners > line) con Poisson sobre el total esperado.
  let cumLowOrEq = 0;
  const threshold = Math.floor(line);
  for (let k = 0; k <= threshold; k++) cumLowOrEq += poisson(k, expected);
  const overLine = clamp01(1 - cumLowOrEq);

  return {
    expected: round1(expected),
    line,
    overLine,
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
