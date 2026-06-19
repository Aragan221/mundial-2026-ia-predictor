// ===========================================================================
// Ratings de selecciones que NO estaban en la lista base de 48, para que el
// modelo reconozca mas equipos reales del Mundial. Clave: nombre normalizado
// (minusculas, sin acentos) tal como lo devuelve API-Football en ingles.
// attack > 1 = marca mas; defense < 1 = concede menos.
// ===========================================================================

export interface ExtraRating {
  name: string;
  fifaRank: number;
  attack: number;
  defense: number;
  form: number;
  cardsAvg: number;
  cornersAvg: number;
}

export const EXTRA_RATINGS: Record<string, ExtraRating> = {
  sweden: { name: "Suecia", fifaRank: 25, attack: 1.08, defense: 0.93, form: 1.01, cardsAvg: 2.0, cornersAvg: 5.0 },
  czechia: { name: "Chequia", fifaRank: 36, attack: 1.06, defense: 0.95, form: 1.0, cardsAvg: 2.1, cornersAvg: 4.9 },
  "czech republic": { name: "Chequia", fifaRank: 36, attack: 1.06, defense: 0.95, form: 1.0, cardsAvg: 2.1, cornersAvg: 4.9 },
  "bosnia and herzegovina": { name: "Bosnia y Herzegovina", fifaRank: 74, attack: 1.04, defense: 0.99, form: 1.0, cardsAvg: 2.4, cornersAvg: 4.7 },
  "bosnia & herzegovina": { name: "Bosnia y Herzegovina", fifaRank: 74, attack: 1.04, defense: 0.99, form: 1.0, cardsAvg: 2.4, cornersAvg: 4.7 },
  haiti: { name: "Haiti", fifaRank: 82, attack: 0.9, defense: 1.06, form: 0.99, cardsAvg: 2.5, cornersAvg: 4.3 },
  serbia: { name: "Serbia", fifaRank: 33, attack: 1.12, defense: 0.94, form: 1.0, cardsAvg: 2.5, cornersAvg: 5.1 },
  hungary: { name: "Hungria", fifaRank: 35, attack: 1.04, defense: 0.96, form: 1.0, cardsAvg: 2.2, cornersAvg: 4.8 },
  greece: { name: "Grecia", fifaRank: 41, attack: 1.0, defense: 0.92, form: 1.02, cardsAvg: 2.3, cornersAvg: 4.7 },
  wales: { name: "Gales", fifaRank: 33, attack: 1.0, defense: 0.97, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.7 },
  ukraine: { name: "Ucrania", fifaRank: 25, attack: 1.07, defense: 0.94, form: 1.01, cardsAvg: 2.2, cornersAvg: 4.9 },
  romania: { name: "Rumania", fifaRank: 45, attack: 1.0, defense: 0.98, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.7 },
  algeria: { name: "Argelia", fifaRank: 38, attack: 1.1, defense: 0.95, form: 1.02, cardsAvg: 2.5, cornersAvg: 5.0 },
  "dr congo": { name: "RD Congo", fifaRank: 56, attack: 1.0, defense: 1.0, form: 1.0, cardsAvg: 2.6, cornersAvg: 4.7 },
  "congo dr": { name: "RD Congo", fifaRank: 56, attack: 1.0, defense: 1.0, form: 1.0, cardsAvg: 2.6, cornersAvg: 4.7 },
  jordan: { name: "Jordania", fifaRank: 64, attack: 0.96, defense: 1.0, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.4 },
  "cape verde": { name: "Cabo Verde", fifaRank: 70, attack: 0.98, defense: 1.0, form: 1.01, cardsAvg: 2.5, cornersAvg: 4.4 },
  "cabo verde": { name: "Cabo Verde", fifaRank: 70, attack: 0.98, defense: 1.0, form: 1.01, cardsAvg: 2.5, cornersAvg: 4.4 },
  jamaica: { name: "Jamaica", fifaRank: 55, attack: 1.0, defense: 1.02, form: 1.0, cardsAvg: 2.5, cornersAvg: 4.5 },
  honduras: { name: "Honduras", fifaRank: 70, attack: 0.94, defense: 1.02, form: 0.99, cardsAvg: 2.5, cornersAvg: 4.4 },
  curacao: { name: "Curazao", fifaRank: 90, attack: 0.92, defense: 1.04, form: 1.0, cardsAvg: 2.4, cornersAvg: 4.2 },
  venezuela: { name: "Venezuela", fifaRank: 50, attack: 1.0, defense: 0.98, form: 1.01, cardsAvg: 2.5, cornersAvg: 4.7 },
  bolivia: { name: "Bolivia", fifaRank: 85, attack: 0.9, defense: 1.05, form: 0.99, cardsAvg: 2.6, cornersAvg: 4.2 },
  chile: { name: "Chile", fifaRank: 45, attack: 1.04, defense: 0.95, form: 0.99, cardsAvg: 2.5, cornersAvg: 4.8 },
  "republic of ireland": { name: "Irlanda", fifaRank: 60, attack: 0.98, defense: 0.98, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.6 },
  ireland: { name: "Irlanda", fifaRank: 60, attack: 0.98, defense: 0.98, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.6 },
  russia: { name: "Rusia", fifaRank: 35, attack: 1.06, defense: 0.96, form: 1.0, cardsAvg: 2.3, cornersAvg: 4.9 },
  finland: { name: "Finlandia", fifaRank: 60, attack: 0.98, defense: 0.98, form: 1.0, cardsAvg: 2.1, cornersAvg: 4.6 },
};
