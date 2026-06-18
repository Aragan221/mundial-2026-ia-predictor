import type { Team, Fixture, ScoreLineProb } from "@/lib/model/types";

// ===========================================================================
// Modelo base: distribucion de Poisson sobre goles esperados (lambda).
// Estandar de la industria para proyectar goles, 1X2, over/under, BTTS y
// marcador exacto. Todo aqui es matematica pura, sin red ni efectos.
// ===========================================================================

// Goles promedio que marca un equipo en un partido neutral de referencia.
const BASE_GOALS = 1.35;

// Ventaja de jugar como local (solo aplica a anfitriones en fase de grupos).
const HOME_ADV = 1.15;
const AWAY_PEN = 0.92;

// Numero maximo de goles considerado en la matriz (cola despreciable arriba).
const MAX_GOALS = 8;

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Probabilidad de marcar exactamente k goles dado un lambda.
export function poisson(k: number, lambda: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

// Ajuste leve por diferencia de ranking FIFA (los rankings altos pesan poco).
function rankFactor(team: Team, rival: Team): number {
  const diff = rival.fifaRank - team.fifaRank;
  // +-0.08 como techo aproximado.
  return 1 + Math.max(-0.08, Math.min(0.08, diff * 0.0016));
}

export interface Lambdas {
  home: number;
  away: number;
}

// Goles esperados de cada equipo en un partido concreto.
export function expectedGoals(
  home: Team,
  away: Team,
  fixture: Fixture,
): Lambdas {
  const venueHome = fixture.neutral ? 1 : HOME_ADV;
  const venueAway = fixture.neutral ? 1 : AWAY_PEN;

  const lambdaHome =
    BASE_GOALS *
    home.attack *
    away.defense *
    home.form *
    rankFactor(home, away) *
    venueHome;

  const lambdaAway =
    BASE_GOALS *
    away.attack *
    home.defense *
    away.form *
    rankFactor(away, home) *
    venueAway;

  // Limites de cordura para evitar valores extremos.
  return {
    home: clamp(lambdaHome, 0.25, 3.6),
    away: clamp(lambdaAway, 0.2, 3.4),
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Matriz de probabilidad de marcadores [home][away].
export function scoreMatrix(lambda: Lambdas): number[][] {
  const m: number[][] = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    m[h] = [];
    const ph = poisson(h, lambda.home);
    for (let a = 0; a <= MAX_GOALS; a++) {
      m[h][a] = ph * poisson(a, lambda.away);
    }
  }
  return m;
}

export interface DerivedMarkets {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  over25: number;
  over35: number;
  bttsYes: number;
  homeCleanSheet: number;
  awayCleanSheet: number;
  topScores: ScoreLineProb[];
}

// Deriva todos los mercados a partir de la matriz de marcadores.
export function deriveMarkets(matrix: number[][]): DerivedMarkets {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over15 = 0;
  let over25 = 0;
  let over35 = 0;
  let bttsYes = 0;
  let homeCleanSheet = 0;
  let awayCleanSheet = 0;
  const scores: ScoreLineProb[] = [];

  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const prob = matrix[h][a];
      const total = h + a;

      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;

      if (total > 1) over15 += prob;
      if (total > 2) over25 += prob;
      if (total > 3) over35 += prob;

      if (h > 0 && a > 0) bttsYes += prob;
      if (a === 0) homeCleanSheet += prob;
      if (h === 0) awayCleanSheet += prob;

      scores.push({ home: h, away: a, prob });
    }
  }

  const topScores = scores.sort((x, y) => y.prob - x.prob).slice(0, 5);

  return {
    homeWin,
    draw,
    awayWin,
    over15,
    over25,
    over35,
    bttsYes,
    homeCleanSheet,
    awayCleanSheet,
    topScores,
  };
}
