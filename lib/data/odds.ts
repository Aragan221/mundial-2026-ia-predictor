import { isConfigured, apiFootballGet } from "@/lib/data/api-football";

// ===========================================================================
// Cuotas reales de las casas de apuestas (endpoint /odds de API-Football).
// Se consulta POR FIXTURE (id) para evitar la paginacion del endpoint por
// fecha. Se toma la MEDIANA de las ~14 casas para cada seleccion.
// ===========================================================================

export interface FixtureOdds {
  home?: number;
  draw?: number;
  away?: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
}

function median(nums: number[]): number | undefined {
  if (!nums.length) return undefined;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export async function fetchOddsForFixtures(
  ids: number[],
): Promise<Map<number, FixtureOdds>> {
  const map = new Map<number, FixtureOdds>();
  if (!isConfigured()) return map;

  for (const id of ids) {
    try {
      const r = await apiFootballGet("/odds", { fixture: id }, { revalidate: 86400 });
      const arr = (r.response as Array<Record<string, any>>) ?? [];
      const item = arr[0];
      if (!item) continue;

      const acc = {
        home: [] as number[],
        draw: [] as number[],
        away: [] as number[],
        over25: [] as number[],
        under25: [] as number[],
        bttsYes: [] as number[],
      };

      for (const bk of item.bookmakers ?? []) {
        for (const bet of bk.bets ?? []) {
          const name = bet.name as string;
          if (name === "Match Winner") {
            for (const v of bet.values ?? []) {
              const o = parseFloat(v.odd);
              if (!Number.isFinite(o)) continue;
              if (v.value === "Home") acc.home.push(o);
              else if (v.value === "Draw") acc.draw.push(o);
              else if (v.value === "Away") acc.away.push(o);
            }
          } else if (name === "Goals Over/Under") {
            for (const v of bet.values ?? []) {
              const o = parseFloat(v.odd);
              if (!Number.isFinite(o)) continue;
              if (v.value === "Over 2.5") acc.over25.push(o);
              else if (v.value === "Under 2.5") acc.under25.push(o);
            }
          } else if (name === "Both Teams Score") {
            for (const v of bet.values ?? []) {
              const o = parseFloat(v.odd);
              if (!Number.isFinite(o)) continue;
              if (v.value === "Yes") acc.bttsYes.push(o);
            }
          }
        }
      }

      map.set(id, {
        home: median(acc.home),
        draw: median(acc.draw),
        away: median(acc.away),
        over25: median(acc.over25),
        under25: median(acc.under25),
        bttsYes: median(acc.bttsYes),
      });
    } catch {
      // Ignora errores por fixture individual.
    }
  }

  return map;
}
