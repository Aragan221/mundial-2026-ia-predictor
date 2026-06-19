// Tipos compartidos por todo el modelo de prediccion.

export interface Player {
  name: string;
  // Peso relativo de goles dentro del equipo (no tiene que sumar 1, se normaliza).
  goalWeight: number;
  position: "DEL" | "MED" | "DEF";
}

export interface Team {
  id: string;
  name: string;
  code: string; // ISO 3 letras, usado para banderas (flagcdn)
  group: string; // "A" .. "L"
  fifaRank: number;
  // Fuerza ofensiva: >1 marca mas que el promedio. Centrado en 1.0.
  attack: number;
  // Fuerza defensiva: <1 concede menos que el promedio. Centrado en 1.0.
  defense: number;
  // Forma reciente (ultimos partidos): factor 0.90 - 1.10.
  form: number;
  // Disciplina: tarjetas promedio por partido.
  cardsAvg: number;
  // Corners promedio a favor por partido.
  cornersAvg: number;
  // Jugadores clave para el modelo de goleadores.
  squad: Player[];
}

export type MatchStage =
  | "Grupos"
  | "16avos"
  | "Octavos"
  | "Cuartos"
  | "Semifinal"
  | "Tercer puesto"
  | "Final";

export interface Fixture {
  id: string;
  stage: MatchStage;
  group?: string;
  // ISO date string
  date: string;
  homeId: string;
  awayId: string;
  venue: string;
  // En partidos de fase de grupos no hay ventaja real de sede salvo el anfitrion.
  neutral: boolean;
}

export interface ScoreLineProb {
  home: number;
  away: number;
  prob: number;
}

export interface MarketResult {
  // 1X2
  homeWin: number;
  draw: number;
  awayWin: number;
  // Doble oportunidad
  homeOrDraw: number; // 1X
  homeOrAway: number; // 12
  drawOrAway: number; // X2
  // Goles esperados
  lambdaHome: number;
  lambdaAway: number;
  expectedGoals: number;
  // Over / Under
  over15: number;
  over25: number;
  over35: number;
  // Ambos marcan
  bttsYes: number;
  // Porteria a cero
  homeCleanSheet: number;
  awayCleanSheet: number;
  // Top marcadores exactos
  topScores: ScoreLineProb[];
  // Tarjetas
  cardsExpected: number;
  cardsOver35: number;
  redCardProb: number;
  // Corners
  cornersExpected: number;
  cornersLine: number;
  cornersOverLine: number;
  // Goleadores
  scorers: { name: string; team: "home" | "away"; anytime: number }[];
}

export interface MatchPrediction {
  fixture: Fixture;
  home: Team;
  away: Team;
  markets: MarketResult;
  // Indice de confianza global (0-100) del partido.
  confidence: number;
  // Marcador mas probable COHERENTE con el resultado 1X2 dominante (para polla).
  pollaScore: { home: number; away: number };
  generatedAt: string;
}
