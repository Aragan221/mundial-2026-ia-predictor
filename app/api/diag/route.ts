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

  return NextResponse.json(out);
}
