import { isConfigured, apiFootballGet } from "@/lib/data/api-football";

// ===========================================================================
// Datos REALES del Mundial 2026 via API-Football usando el parametro `date`,
// que SI esta permitido en el plan Free (fechas entre hoy-1 y hoy+1).
// El parametro `season=2026` esta bloqueado en el plan Free, por eso usamos
// la fecha. La Copa Mundial es league id = 1.
// ===========================================================================

const WORLD_CUP_LEAGUE_ID = 1;

export interface LiveTeam {
  name: string;
  logo: string;
  goals: number | null;
  winner: boolean | null;
}

export interface LiveMatch {
  id: number;
  dateISO: string;
  statusShort: string; // NS, 1H, HT, 2H, FT, LIVE, etc.
  statusLong: string;
  elapsed: number | null;
  round: string;
  venue: string;
  home: LiveTeam;
  away: LiveTeam;
}

export interface LiveResult {
  configured: boolean;
  matches: LiveMatch[];
  dates: string[];
  requestsInfo?: unknown;
  error?: string;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function normalize(f: Record<string, any>): LiveMatch {
  return {
    id: f.fixture?.id,
    dateISO: f.fixture?.date,
    statusShort: f.fixture?.status?.short ?? "NS",
    statusLong: f.fixture?.status?.long ?? "",
    elapsed: f.fixture?.status?.elapsed ?? null,
    round: f.league?.round ?? "",
    venue: f.fixture?.venue?.name
      ? `${f.fixture.venue.name}${f.fixture.venue.city ? `, ${f.fixture.venue.city}` : ""}`
      : "",
    home: {
      name: f.teams?.home?.name ?? "",
      logo: f.teams?.home?.logo ?? "",
      goals: f.goals?.home ?? null,
      winner: f.teams?.home?.winner ?? null,
    },
    away: {
      name: f.teams?.away?.name ?? "",
      logo: f.teams?.away?.logo ?? "",
      goals: f.goals?.away ?? null,
      winner: f.teams?.away?.winner ?? null,
    },
  };
}

// Trae los partidos REALES del Mundial para hoy-1, hoy y hoy+1.
export async function fetchWorldCupLive(): Promise<LiveResult> {
  if (!isConfigured()) {
    return { configured: false, matches: [], dates: [] };
  }

  const today = new Date();
  const dates = [-1, 0, 1].map((off) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + off);
    return ymd(d);
  });

  const matches: LiveMatch[] = [];
  try {
    for (const date of dates) {
      // IMPORTANTE: en el plan Free NO se puede combinar league=1 con date
      // (lo asocia a la temporada 2026 bloqueada y devuelve 0). Por eso se
      // consulta solo por `date` y se filtra el Mundial (id 1) aqui.
      const r = await apiFootballGet("/fixtures", { date }, { revalidate: 86400 });
      const arr = (r.response as Array<Record<string, any>>) ?? [];
      for (const f of arr) {
        if (f?.league?.id === WORLD_CUP_LEAGUE_ID) matches.push(normalize(f));
      }
    }
  } catch (e) {
    return { configured: true, matches: [], dates, error: String(e) };
  }

  // Ordena por fecha.
  matches.sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime(),
  );

  return { configured: true, matches, dates };
}

// Estado legible en espanol y si el partido esta en vivo.
export function statusInfo(m: LiveMatch): { label: string; live: boolean; done: boolean } {
  const live = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(
    m.statusShort,
  );
  const done = ["FT", "AET", "PEN"].includes(m.statusShort);
  let label: string;
  if (live) {
    label = m.statusShort === "HT" ? "Descanso" : `EN VIVO ${m.elapsed ?? ""}'`;
  } else if (done) {
    label = "Finalizado";
  } else {
    label = "Programado";
  }
  return { label, live, done };
}
