import type { Team } from "@/lib/model/types";
import type { Lambdas } from "@/lib/model/poisson";

// ===========================================================================
// Goleadores: se reparte el lambda (goles esperados) del equipo entre sus
// jugadores segun su peso goleador. Con la tasa individual de goles esperados
// se calcula la probabilidad de marcar "en cualquier momento" (1 - P(0 goles)).
// ===========================================================================

export interface ScorerProb {
  name: string;
  team: "home" | "away";
  anytime: number;
}

// Fraccion del lambda del equipo que generan los jugadores de campo (resto:
// autogoles, defensas a balon parado, etc.).
const ATTACK_SHARE = 0.82;

function teamScorers(
  team: Team,
  teamLambda: number,
  side: "home" | "away",
): ScorerProb[] {
  const totalWeight = team.squad.reduce((s, p) => s + p.goalWeight, 0) || 1;

  return team.squad.map((player) => {
    const share = (player.goalWeight / totalWeight) * ATTACK_SHARE;
    const playerLambda = teamLambda * share;
    // Probabilidad de marcar al menos una vez (Poisson).
    const anytime = 1 - Math.exp(-playerLambda);
    return { name: player.name, team: side, anytime: clamp01(anytime) };
  });
}

export function scorersMarket(
  home: Team,
  away: Team,
  lambda: Lambdas,
): ScorerProb[] {
  const all = [
    ...teamScorers(home, lambda.home, "home"),
    ...teamScorers(away, lambda.away, "away"),
  ];
  return all.sort((a, b) => b.anytime - a.anytime);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
