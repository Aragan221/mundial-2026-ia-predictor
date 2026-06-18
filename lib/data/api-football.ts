// ===========================================================================
// Cliente de API-Football (API-SPORTS). Soporta el registro directo
// (v3.football.api-sports.io) y la version via RapidAPI. Lee la configuracion
// de las variables de entorno definidas en .env.local.
//
//   API_FOOTBALL_KEY       -> tu API key
//   API_FOOTBALL_HOST      -> v3.football.api-sports.io  o  api-football-v1.p.rapidapi.com
//   API_FOOTBALL_PROVIDER  -> "direct" o "rapidapi"
//
// El modelo NUNCA llama a este cliente: solo el cron lo usa para refrescar
// data. Asi el modelo se mantiene rapido y testeable.
// ===========================================================================

const KEY = process.env.API_FOOTBALL_KEY ?? "";
const PROVIDER = (process.env.API_FOOTBALL_PROVIDER ?? "direct").toLowerCase();
const HOST =
  process.env.API_FOOTBALL_HOST ??
  (PROVIDER === "rapidapi"
    ? "api-football-v1.p.rapidapi.com"
    : "v3.football.api-sports.io");

const BASE_URL =
  PROVIDER === "rapidapi"
    ? `https://${HOST}/v3`
    : `https://${HOST}`;

export function isConfigured(): boolean {
  return KEY.length > 0;
}

function headers(): Record<string, string> {
  if (PROVIDER === "rapidapi") {
    return {
      "x-rapidapi-key": KEY,
      "x-rapidapi-host": HOST,
    };
  }
  // Registro directo (api-football.com)
  return { "x-apisports-key": KEY };
}

interface ApiResponse<T> {
  response: T;
  errors?: unknown;
  results?: number;
}

async function request<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  if (!isConfigured()) {
    throw new Error(
      "API_FOOTBALL_KEY no configurada. Copia .env.example a .env.local y pega tu key.",
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  // Cache de 1 hora para respetar el limite del plan free (100 req/dia).
  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`API-Football ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as ApiResponse<T>;
  return data.response;
}

// Peticion generica que devuelve la respuesta cruda (incluye results y errors).
// La usa el endpoint de diagnostico para inspeccionar el plan y la cobertura.
export interface RawApiResult {
  results: number;
  errors: unknown;
  response: unknown;
}

export async function apiFootballGet(
  path: string,
  params: Record<string, string | number> = {},
  options: { revalidate?: number } = {},
): Promise<RawApiResult> {
  if (!isConfigured()) {
    throw new Error("API_FOOTBALL_KEY no configurada.");
  }
  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  // Por defecto sin cache (diagnostico). Para datos en vivo se pasa revalidate
  // para cachear y respetar el limite de 100 peticiones/dia del plan Free.
  const fetchOpts: RequestInit & { next?: { revalidate: number } } =
    typeof options.revalidate === "number"
      ? { headers: headers(), next: { revalidate: options.revalidate } }
      : { headers: headers(), cache: "no-store" };

  const res = await fetch(url.toString(), fetchOpts);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    results: typeof json.results === "number" ? json.results : 0,
    errors: json.errors ?? null,
    response: json.response ?? null,
  };
}

// ID de la Copa Mundial en API-Football.
export const WORLD_CUP_LEAGUE_ID = 1;
export const WORLD_CUP_SEASON = 2026;

// --- Endpoints de alto nivel (los consume el cron) ---

export interface ApiFixture {
  fixture: { id: number; date: string; venue: { name: string; city: string } };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
}

export async function fetchWorldCupFixtures(): Promise<ApiFixture[]> {
  return request<ApiFixture[]>("/fixtures", {
    league: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
  });
}

export interface ApiTeamStats {
  team: { id: number; name: string };
  goals: {
    for: { average: { total: string } };
    against: { average: { total: string } };
  };
}

export async function fetchTeamStats(teamId: number): Promise<ApiTeamStats> {
  const r = await request<ApiTeamStats>("/teams/statistics", {
    league: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    team: teamId,
  });
  return r;
}
