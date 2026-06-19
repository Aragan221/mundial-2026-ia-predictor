import { predictReal, type Pick } from "@/lib/model/realpredict";

// ===========================================================================
// Construye parleys (apuestas combinadas) a partir de los partidos proximos.
// Para cada partido toma su apuesta mas probable y combina las mejores.
// La probabilidad combinada es el producto; la cuota implicita es 1/prob.
// ===========================================================================

export interface ParlayLeg {
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
  pick: Pick;
  odds: number; // cuota implicita de la seleccion (1 / prob)
}

export interface Parlay {
  name: string;
  legs: ParlayLeg[];
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

export function buildParlays(matches: UpcomingMatch[]): ParlaysResult {
  const legs: ParlayLeg[] = matches
    .map((m) => {
      const pred = predictReal(m.homeName, m.awayName);
      const pick = pred.bestPick;
      return {
        homeName: m.homeName,
        awayName: m.awayName,
        homeLogo: m.homeLogo,
        awayLogo: m.awayLogo,
        pick,
        odds: pick.prob > 0 ? 1 / pick.prob : 0,
      };
    })
    .sort((a, b) => b.pick.prob - a.pick.prob);

  const make = (name: string, n: number): Parlay => {
    const sel = legs.slice(0, n);
    const combinedProb = sel.reduce((p, l) => p * l.pick.prob, 1);
    return {
      name,
      legs: sel,
      combinedProb,
      combinedOdds: combinedProb > 0 ? 1 / combinedProb : 0,
    };
  };

  const parlays: Parlay[] = [];
  if (legs.length >= 2) parlays.push(make("Parley seguro · 2 selecciones", 2));
  if (legs.length >= 3) parlays.push(make("Parley equilibrado · 3 selecciones", 3));
  if (legs.length >= 4) parlays.push(make("Parley arriesgado · 4 selecciones", 4));

  return { legs, parlays };
}
