import { NextResponse } from "next/server";
import { isConfigured, apiFootballGet } from "@/lib/data/api-football";

// ===========================================================================
// Endpoint de diagnostico: inspecciona el plan de API-Football y que datos del
// Mundial estan disponibles en tu cuenta. Abrelo en el navegador:
//   /api/diag
// Hace ~6 peticiones (de las 100 diarias del plan free).
// ===========================================================================

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface Diag {
  ok: boolean;
  reason?: string;
  plan?: unknown;
  active?: unknown;
  requests?: unknown;
  worldCup?: {
    found: boolean;
    name: string | null;
    seasons: number[];
  };
  fixtureCounts?: Record<string, number | string>;
  errors?: Record<string, unknown>;
  dateProbe?: Record<string, unknown>;
  oddsProbe?: Record<string, unknown>;
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({
      ok: false,
      reason: "No hay API key configurada en las variables de entorno.",
    } satisfies Diag);
  }

  const out: Diag = { ok: true, errors: {} };

  // 1. Estado de la cuenta: plan y peticiones disponibles.
  try {
    const status = await apiFootballGet("/status");
    const r = status.response as Record<string, any> | null;
    out.plan = r?.subscription?.plan ?? null;
    out.active = r?.subscription?.active ?? null;
    out.requests = r?.requests ?? null;
    if (status.errors && Object.keys(status.errors as object).length) {
      out.errors!.status = status.errors;
    }
  } catch (e) {
    out.errors!.status = String(e);
  }

  // 2. Cobertura de la liga "World Cup" (id=1): temporadas disponibles.
  try {
    const leagues = await apiFootballGet("/leagues", { id: 1 });
    const arr = leagues.response as Array<Record<string, any>> | null;
    const league = Array.isArray(arr) ? arr[0] : null;
    out.worldCup = {
      found: !!league,
      name: league?.league?.name ?? null,
      seasons: Array.isArray(league?.seasons)
        ? league.seasons.map((s: { year: number }) => s.year)
        : [],
    };
    if (leagues.errors && Object.keys(leagues.errors as object).length) {
      out.errors!.leagues = leagues.errors;
    }
  } catch (e) {
    out.errors!.leagues = String(e);
  }

  // 3. Conteo de partidos para varias temporadas candidatas del Mundial.
  out.fixtureCounts = {};
  for (const season of [2026, 2025, 2022, 2018]) {
    try {
      const fx = await apiFootballGet("/fixtures", { league: 1, season });
      out.fixtureCounts[String(season)] = fx.results;
    } catch (e) {
      out.fixtureCounts[String(season)] = `error: ${String(e)}`;
    }
  }

  // 4. Sonda por FECHA (lo permitido en plan Free: hoy +-1 dia).
  //    Consulta sin filtrar liga para ver QUE devuelve realmente tu plan.
  const today = new Date();
  const probe: Record<string, unknown> = {};
  for (const off of [-1, 0, 1]) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + off);
    const date = d.toISOString().slice(0, 10);
    try {
      const r = await apiFootballGet("/fixtures", { date });
      const arr = (r.response as Array<Record<string, any>>) ?? [];
      // Agrupa por liga para ver que competiciones aparecen.
      const leagues: Record<string, { name: string; season: number; count: number }> = {};
      for (const f of arr) {
        const id = f?.league?.id;
        if (id == null) continue;
        const key = String(id);
        if (!leagues[key]) {
          leagues[key] = {
            name: f.league?.name ?? "",
            season: f.league?.season ?? 0,
            count: 0,
          };
        }
        leagues[key].count++;
      }
      probe[date] = {
        total: r.results,
        errors: r.errors,
        leagues,
        worldCupId1: leagues["1"] ?? null,
      };
    } catch (e) {
      probe[date] = { error: String(e) };
    }
  }
  out.dateProbe = probe;

  // 5. Sonda de CUOTAS (odds) para validar la funcion de Value Bets.
  const today2 = new Date().toISOString().slice(0, 10);
  const odds: Record<string, unknown> = {};
  try {
    const r = await apiFootballGet("/odds", { date: today2 });
    const arr = (r.response as Array<Record<string, any>>) ?? [];
    let wc = 0;
    for (const f of arr) if (f?.league?.id === 1) wc++;
    const sample = arr[0];
    odds.total = r.results;
    odds.errors = r.errors;
    odds.worldCupWithOdds = wc;
    if (sample) {
      const bk = sample.bookmakers?.[0];
      odds.sample = {
        league: sample.league?.id,
        bookmakers: (sample.bookmakers ?? []).length,
        firstBookmaker: bk?.name ?? null,
        markets: Array.isArray(bk?.bets)
          ? bk.bets.map((b: { name: string }) => b.name).slice(0, 10)
          : [],
      };
    }
  } catch (e) {
    odds.error = String(e);
  }
  out.oddsProbe = odds;

  return NextResponse.json(out);
}
