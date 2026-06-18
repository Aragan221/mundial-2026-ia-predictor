// ===========================================================================
// Cron de recalculo diario.
//   pnpm cron:run   -> lo ejecutas manualmente
//   Vercel Cron     -> lo dispara 1 vez al dia (ver vercel.json)
//
// Flujo:
//   1. Si hay API key, trae fixtures/resultados nuevos de API-Football.
//   2. Corre el modelo de prediccion sobre los 72 partidos.
//   3. Corre el Monte Carlo del torneo (campeon + Bota de Oro).
//   4. Guarda todo en /data con timestamp (historico de predicciones).
// ===========================================================================

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { predictAll } from "@/lib/model/predict";
import { runTournament } from "@/lib/model/montecarlo";
import { isConfigured, fetchWorldCupFixtures } from "@/lib/data/api-football";

async function main() {
  const startedAt = new Date();
  console.log(`[cron] Inicio: ${startedAt.toISOString()}`);

  // 1. Ingesta (opcional, solo si hay API key configurada).
  if (isConfigured()) {
    try {
      const fixtures = await fetchWorldCupFixtures();
      console.log(`[cron] API-Football: ${fixtures.length} fixtures recibidos.`);
      // Aqui normalizarias y guardarias en DB para ajustar ratings/forma.
    } catch (err) {
      console.warn(`[cron] Aviso: no se pudo leer API-Football. ${String(err)}`);
      console.warn("[cron] Continuo con los datos semilla.");
    }
  } else {
    console.log("[cron] Sin API key: uso datos semilla (data/teams.ts).");
  }

  // 2. Predicciones por partido.
  const matches = predictAll();
  console.log(`[cron] Predicciones generadas para ${matches.length} partidos.`);

  // 3. Proyeccion del torneo (Monte Carlo).
  const tournament = runTournament();
  const top = tournament.champion[0];
  console.log(
    `[cron] Favorito al titulo: ${top.team.name} (${top.pct.toFixed(1)}%).`,
  );

  // 4. Persistencia con timestamp.
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const stamp = startedAt.toISOString().replace(/[:.]/g, "-");
  const payload = {
    generatedAt: startedAt.toISOString(),
    matches,
    tournament,
  };

  writeFileSync(
    join(dataDir, "latest.json"),
    JSON.stringify(payload, null, 2),
    "utf8",
  );
  writeFileSync(
    join(dataDir, `predictions-${stamp}.json`),
    JSON.stringify(payload, null, 2),
    "utf8",
  );

  const ms = Date.now() - startedAt.getTime();
  console.log(`[cron] Listo en ${ms} ms. Guardado en /data/latest.json`);
}

main().catch((err) => {
  console.error("[cron] Error fatal:", err);
  process.exit(1);
});
