import type { Team } from "@/lib/model/types";
import { teamsInGroup } from "@/lib/data/teams";
import { fixturesByGroup } from "@/lib/data/fixtures";
import { predictMatch } from "@/lib/model/predict";

// ===========================================================================
// Clasificacion proyectada de un grupo: para cada partido se calculan las
// probabilidades 1X2 y se acumulan PUNTOS ESPERADOS (3*Pvictoria + 1*Pempate)
// y GOLES ESPERADOS a favor / en contra. Ranking determinista y estable.
// ===========================================================================

export interface ProjectedStanding {
  team: Team;
  xPoints: number;
  xGoalsFor: number;
  xGoalsAgainst: number;
  // Probabilidad aproximada de avanzar (top 2 garantiza, top 3 opcion).
  advanceHint: "Clasifica" | "Disputa" | "Eliminado";
}

export function projectGroup(group: string): ProjectedStanding[] {
  const teams = teamsInGroup(group);
  const acc: Record<string, ProjectedStanding> = {};
  teams.forEach((t) => {
    acc[t.id] = {
      team: t,
      xPoints: 0,
      xGoalsFor: 0,
      xGoalsAgainst: 0,
      advanceHint: "Disputa",
    };
  });

  for (const f of fixturesByGroup(group)) {
    const p = predictMatch(f);
    const { homeWin, draw, awayWin, lambdaHome, lambdaAway } = p.markets;

    acc[f.homeId].xPoints += homeWin * 3 + draw;
    acc[f.awayId].xPoints += awayWin * 3 + draw;
    acc[f.homeId].xGoalsFor += lambdaHome;
    acc[f.homeId].xGoalsAgainst += lambdaAway;
    acc[f.awayId].xGoalsFor += lambdaAway;
    acc[f.awayId].xGoalsAgainst += lambdaHome;
  }

  const table = Object.values(acc).sort((a, b) => {
    if (b.xPoints !== a.xPoints) return b.xPoints - a.xPoints;
    const dgA = a.xGoalsFor - a.xGoalsAgainst;
    const dgB = b.xGoalsFor - b.xGoalsAgainst;
    return dgB - dgA;
  });

  table.forEach((row, i) => {
    row.advanceHint = i <= 1 ? "Clasifica" : i === 2 ? "Disputa" : "Eliminado";
  });

  return table;
}
