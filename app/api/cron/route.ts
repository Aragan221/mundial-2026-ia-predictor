import { NextResponse } from "next/server";
import { predictAll } from "@/lib/model/predict";
import { runTournament } from "@/lib/model/montecarlo";
import { isConfigured, fetchWorldCupFixtures } from "@/lib/data/api-football";

// Ruta que dispara Vercel Cron (ver vercel.json) una vez al dia.
// Tambien puedes llamarla manualmente: GET /api/cron

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const startedAt = new Date();

  let apiStatus = "sin-key";
  if (isConfigured()) {
    try {
      const fixtures = await fetchWorldCupFixtures();
      apiStatus = `ok (${fixtures.length} fixtures)`;
    } catch (err) {
      apiStatus = `error: ${String(err)}`;
    }
  }

  const matches = predictAll();
  const tournament = runTournament();

  return NextResponse.json({
    ok: true,
    generatedAt: startedAt.toISOString(),
    durationMs: Date.now() - startedAt.getTime(),
    apiFootball: apiStatus,
    matches: matches.length,
    favorite: {
      team: tournament.champion[0]?.team.name,
      pct: tournament.champion[0]?.pct,
    },
    goldenBoot: tournament.goldenBoot[0]?.name,
  });
}
