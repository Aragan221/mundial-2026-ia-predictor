import type {
  Fixture,
  MatchPrediction,
  MarketResult,
  Team,
} from "@/lib/model/types";
import {
  expectedGoals,
  scoreMatrix,
  deriveMarkets,
  type Lambdas,
} from "@/lib/model/poisson";
import { cardsMarket } from "@/lib/model/cards";
import { cornersMarket } from "@/lib/model/corners";
import { scorersMarket } from "@/lib/model/scorers";
import { getTeam } from "@/lib/data/teams";
import { FIXTURES } from "@/lib/data/fixtures";

// ===========================================================================
// Orquestador: toma un fixture, corre el modelo y devuelve TODOS los mercados
// listos para la UI.
// ===========================================================================

export function predictMatch(fixture: Fixture): MatchPrediction {
  const home = getTeam(fixture.homeId);
  const away = getTeam(fixture.awayId);

  const lambda: Lambdas = expectedGoals(home, away, fixture);
  const matrix = scoreMatrix(lambda);
  const d = deriveMarkets(matrix);
  const cards = cardsMarket(home, away);
  const corners = cornersMarket(home, away, lambda);
  const scorers = scorersMarket(home, away, lambda).slice(0, 6);

  const markets: MarketResult = {
    homeWin: d.homeWin,
    draw: d.draw,
    awayWin: d.awayWin,
    homeOrDraw: d.homeWin + d.draw,
    homeOrAway: d.homeWin + d.awayWin,
    drawOrAway: d.draw + d.awayWin,
    lambdaHome: lambda.home,
    lambdaAway: lambda.away,
    expectedGoals: lambda.home + lambda.away,
    over15: d.over15,
    over25: d.over25,
    over35: d.over35,
    bttsYes: d.bttsYes,
    homeCleanSheet: d.homeCleanSheet,
    awayCleanSheet: d.awayCleanSheet,
    topScores: d.topScores,
    cardsExpected: cards.expected,
    cardsOver35: cards.over35,
    redCardProb: cards.redCardProb,
    cornersExpected: corners.expected,
    cornersLine: corners.line,
    cornersOverLine: corners.overLine,
    scorers,
  };

  return {
    fixture,
    home,
    away,
    markets,
    confidence: confidenceIndex(home, away, markets),
    pollaScore: consistentScore(matrix, d.homeWin, d.draw, d.awayWin),
    generatedAt: new Date().toISOString(),
  };
}

// Marcador mas probable COHERENTE con el resultado 1X2 dominante.
// Evita mostrar "1-1" con signo de victoria: busca el marcador mas probable
// DENTRO del resultado pronosticado (local / empate / visitante).
function consistentScore(
  matrix: number[][],
  homeWin: number,
  draw: number,
  awayWin: number,
): { home: number; away: number } {
  const outcome =
    homeWin >= draw && homeWin >= awayWin
      ? "1"
      : awayWin >= draw
        ? "2"
        : "X";

  let best = { home: outcome === "2" ? 0 : 1, away: outcome === "1" ? 0 : 1 };
  let bestP = -1;
  for (let hg = 0; hg < matrix.length; hg++) {
    for (let ag = 0; ag < matrix[hg].length; ag++) {
      const match =
        outcome === "1" ? hg > ag : outcome === "2" ? ag > hg : hg === ag;
      if (match && matrix[hg][ag] > bestP) {
        bestP = matrix[hg][ag];
        best = { home: hg, away: ag };
      }
    }
  }
  return best;
}

// Indice de confianza 0-100: mas alto cuando un resultado domina claramente y
// los equipos tienen ranking definido.
function confidenceIndex(
  home: Team,
  away: Team,
  m: MarketResult,
): number {
  const topOutcome = Math.max(m.homeWin, m.draw, m.awayWin);
  // 0.33 (incierto) -> 0 ; 0.85 (claro) -> ~100
  const dominance = (topOutcome - 0.33) / (0.85 - 0.33);
  const rankQuality =
    1 - Math.min(1, (home.fifaRank + away.fifaRank) / 200);
  const score = (dominance * 0.7 + rankQuality * 0.3) * 100;
  return Math.round(clamp(score, 5, 96));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function predictAll(): MatchPrediction[] {
  return FIXTURES.map(predictMatch);
}

export function predictById(id: string): MatchPrediction | undefined {
  const f = FIXTURES.find((x) => x.id === id);
  return f ? predictMatch(f) : undefined;
}
