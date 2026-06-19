import { predictReal } from "@/lib/model/realpredict";
import type { FixtureOdds } from "@/lib/data/odds";

// ===========================================================================
// Value bets: compara la probabilidad del modelo con la cuota real de las
// casas. Valor esperado = probabilidad_modelo * cuota - 1. Si es > 0, el
// modelo cree que el mercado esta "pagando de mas" (hay valor).
// Se omiten cuotas > 6 (longshots) para evitar falsos positivos.
// ===========================================================================

export interface ValueMatch {
  id: number;
  homeName: string;
  awayName: string;
  kickoff: string;
}

export interface ValueOpp {
  homeName: string;
  awayName: string;
  kickoff: string;
  market: string;
  modelProb: number;
  odd: number;
  value: number; // EV = prob * odd - 1
}

export function computeValue(
  matches: ValueMatch[],
  oddsMap: Map<number, FixtureOdds>,
): ValueOpp[] {
  const opps: ValueOpp[] = [];

  for (const m of matches) {
    const o = oddsMap.get(m.id);
    if (!o) continue;

    const pred = predictReal(m.homeName, m.awayName);
    const r = pred.raw;

    const candidates: { market: string; prob: number; odd?: number }[] = [
      { market: `Gana ${m.homeName}`, prob: r.homeWin, odd: o.home },
      { market: "Empate", prob: r.draw, odd: o.draw },
      { market: `Gana ${m.awayName}`, prob: r.awayWin, odd: o.away },
      { market: "Mas de 2.5 goles", prob: r.over25, odd: o.over25 },
      { market: "Menos de 2.5 goles", prob: r.under25, odd: o.under25 },
      { market: "Ambos marcan", prob: r.bttsYes, odd: o.bttsYes },
    ];

    for (const c of candidates) {
      if (c.odd == null || c.odd <= 1 || c.odd > 6) continue;
      const value = c.prob * c.odd - 1;
      opps.push({
        homeName: m.homeName,
        awayName: m.awayName,
        kickoff: m.kickoff,
        market: c.market,
        modelProb: c.prob,
        odd: c.odd,
        value,
      });
    }
  }

  return opps.sort((a, b) => b.value - a.value);
}
