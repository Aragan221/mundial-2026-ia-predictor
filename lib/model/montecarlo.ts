import type { Team } from "@/lib/model/types";
import { TEAMS, GROUPS, teamsInGroup } from "@/lib/data/teams";

// ===========================================================================
// Monte Carlo: corre el torneo completo N veces y cuenta frecuencias para
// proyectar campeon, finalistas y Bota de Oro. Goles muestreados de Poisson.
// ===========================================================================

const SIMULATIONS = 10000;
const BASE_GOALS = 1.35;

// --- Muestreo de Poisson (algoritmo de Knuth) ---
function samplePoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function rankFactor(team: Team, rival: Team): number {
  const diff = rival.fifaRank - team.fifaRank;
  return 1 + Math.max(-0.08, Math.min(0.08, diff * 0.0016));
}

function lambdasFor(home: Team, away: Team): [number, number] {
  const lh =
    BASE_GOALS * home.attack * away.defense * home.form * rankFactor(home, away);
  const la =
    BASE_GOALS * away.attack * home.defense * away.form * rankFactor(away, home);
  return [clamp(lh, 0.25, 3.6), clamp(la, 0.2, 3.4)];
}

interface SimMatch {
  hg: number;
  ag: number;
}

function simMatch(home: Team, away: Team): SimMatch {
  const [lh, la] = lambdasFor(home, away);
  return { hg: samplePoisson(lh), ag: samplePoisson(la) };
}

// Desempate de eliminatoria por "penales": ganador ponderado por fuerza.
function penaltyWinner(a: Team, b: Team): Team {
  const sa = a.attack / a.defense;
  const sb = b.attack / b.defense;
  return Math.random() < sa / (sa + sb) ? a : b;
}

function knockoutWinner(a: Team, b: Team): { winner: Team; goals: GoalTally } {
  const m = simMatch(a, b);
  const tally: GoalTally = {};
  addGoals(tally, a, m.hg);
  addGoals(tally, b, m.ag);
  let winner: Team;
  if (m.hg > m.ag) winner = a;
  else if (m.ag > m.hg) winner = b;
  else winner = penaltyWinner(a, b);
  return { winner, goals: tally };
}

type GoalTally = Record<string, number>; // playerName -> goles

function addGoals(tally: GoalTally, team: Team, goals: number) {
  if (goals <= 0) return;
  const totalWeight = team.squad.reduce((s, p) => s + p.goalWeight, 0) || 1;
  for (let g = 0; g < goals; g++) {
    // 82% de los goles los marcan los jugadores clave, segun su peso.
    if (Math.random() < 0.82) {
      let r = Math.random() * totalWeight;
      for (const pl of team.squad) {
        r -= pl.goalWeight;
        if (r <= 0) {
          tally[pl.name] = (tally[pl.name] || 0) + 1;
          break;
        }
      }
    }
  }
}

interface GroupStanding {
  team: Team;
  pts: number;
  gf: number;
  ga: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

const ROUND_ROBIN: [number, number][] = [
  [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
];

export interface MonteCarloResult {
  simulations: number;
  champion: { team: Team; pct: number }[];
  finalist: { team: Team; pct: number }[];
  goldenBoot: { name: string; teamName: string; avgGoals: number }[];
  generatedAt: string;
}

function runSimulations(n: number): MonteCarloResult {
  const championCount: Record<string, number> = {};
  const finalistCount: Record<string, number> = {};
  const scorerGoals: Record<string, { team: string; total: number }> = {};

  const groupTeams: Record<string, Team[]> = {};
  GROUPS.forEach((g) => (groupTeams[g] = teamsInGroup(g)));

  for (let sim = 0; sim < n; sim++) {
    const tally: GoalTally = {};
    const qualifiers: Team[] = [];
    const thirds: GroupStanding[] = [];

    // --- Fase de grupos ---
    for (const g of GROUPS) {
      const teams = groupTeams[g];
      const table: GroupStanding[] = teams.map((t) => ({
        team: t, pts: 0, gf: 0, ga: 0,
      }));

      for (const [a, b] of ROUND_ROBIN) {
        const m = simMatch(teams[a], teams[b]);
        addGoals(tally, teams[a], m.hg);
        addGoals(tally, teams[b], m.ag);
        table[a].gf += m.hg; table[a].ga += m.ag;
        table[b].gf += m.ag; table[b].ga += m.hg;
        if (m.hg > m.ag) table[a].pts += 3;
        else if (m.ag > m.hg) table[b].pts += 3;
        else { table[a].pts += 1; table[b].pts += 1; }
      }

      table.sort(cmpStanding);
      qualifiers.push(table[0].team, table[1].team);
      thirds.push(table[2]);
    }

    // 8 mejores terceros completan los 32.
    thirds.sort(cmpStanding);
    for (let i = 0; i < 8; i++) qualifiers.push(thirds[i].team);

    // --- Eliminatorias (32 -> campeon) con emparejamiento aleatorio ---
    let bracket = shuffle(qualifiers);
    let finalists: Team[] = [];
    while (bracket.length > 1) {
      const next: Team[] = [];
      const isFinalRound = bracket.length === 2;
      for (let i = 0; i < bracket.length; i += 2) {
        const { winner, goals } = knockoutWinner(bracket[i], bracket[i + 1]);
        mergeGoals(tally, goals);
        next.push(winner);
        if (isFinalRound) finalists = [bracket[i], bracket[i + 1]];
      }
      bracket = next;
    }

    const champ = bracket[0];
    championCount[champ.id] = (championCount[champ.id] || 0) + 1;
    finalists.forEach((t) => {
      finalistCount[t.id] = (finalistCount[t.id] || 0) + 1;
    });

    // Acumular goles para Bota de Oro.
    for (const [name, goals] of Object.entries(tally)) {
      const team = findTeamByPlayer(name);
      if (!scorerGoals[name]) {
        scorerGoals[name] = { team: team?.name ?? "", total: 0 };
      }
      scorerGoals[name].total += goals;
    }
  }

  return {
    simulations: n,
    champion: toPct(championCount, n),
    finalist: toPct(finalistCount, n),
    goldenBoot: Object.entries(scorerGoals)
      .map(([name, v]) => ({
        name,
        teamName: v.team,
        avgGoals: v.total / n,
      }))
      .sort((a, b) => b.avgGoals - a.avgGoals)
      .slice(0, 10),
    generatedAt: new Date().toISOString(),
  };
}

function cmpStanding(a: GroupStanding, b: GroupStanding): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gf - b.ga !== a.gf - a.ga) return (b.gf - b.ga) - (a.gf - a.ga);
  return b.gf - a.gf;
}

function toPct(count: Record<string, number>, n: number) {
  return Object.entries(count)
    .map(([id, c]) => ({
      team: TEAMS.find((t) => t.id === id)!,
      pct: (c / n) * 100,
    }))
    .filter((x) => x.team)
    .sort((a, b) => b.pct - a.pct);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mergeGoals(into: GoalTally, from: GoalTally) {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] || 0) + v;
}

const PLAYER_TEAM_INDEX: Record<string, Team> = (() => {
  const idx: Record<string, Team> = {};
  for (const t of TEAMS) for (const p of t.squad) idx[p.name] = t;
  return idx;
})();

function findTeamByPlayer(name: string): Team | undefined {
  return PLAYER_TEAM_INDEX[name];
}

// --- Memoizacion: el Monte Carlo se corre una sola vez por proceso ---
let cached: MonteCarloResult | null = null;

export function getTournamentProjection(): MonteCarloResult {
  if (!cached) cached = runSimulations(SIMULATIONS);
  return cached;
}

// Version explicita usada por el cron (sin cache).
export function runTournament(n = SIMULATIONS): MonteCarloResult {
  return runSimulations(n);
}
