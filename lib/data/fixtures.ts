import type { Fixture } from "@/lib/model/types";
import { GROUPS, teamsInGroup, getTeam } from "@/lib/data/teams";

// ===========================================================================
// 72 partidos de la fase de grupos: 12 grupos x 6 partidos (round-robin de 4).
// Las sedes y fechas son una linea base; el cron las reemplaza con los
// fixtures reales de API-Football cuando conectas tu API key.
// ===========================================================================

const VENUES = [
  "MetLife Stadium, Nueva York",
  "SoFi Stadium, Los Angeles",
  "AT&T Stadium, Dallas",
  "Estadio Azteca, Ciudad de Mexico",
  "BMO Field, Toronto",
  "Mercedes-Benz Stadium, Atlanta",
  "Hard Rock Stadium, Miami",
  "Lumen Field, Seattle",
  "Levi's Stadium, San Francisco",
  "Arrowhead Stadium, Kansas City",
  "NRG Stadium, Houston",
  "Estadio BBVA, Monterrey",
];

// Equipos anfitriones (juegan "en casa", sin neutralidad).
const HOSTS = new Set(["usa", "mex", "can"]);

// Emparejamientos round-robin para 4 equipos (indices 0-3).
const ROUND_ROBIN: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

function buildGroupFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  let venueIdx = 0;

  GROUPS.forEach((group, gi) => {
    const teams = teamsInGroup(group);
    ROUND_ROBIN.forEach(([a, b], mi) => {
      const home = teams[a];
      const away = teams[b];
      // Fechas escalonadas entre el 11 de junio y el 27 de junio de 2026.
      const baseDay = 11 + mi * 2 + Math.floor(gi / 6);
      const date = new Date(Date.UTC(2026, 5, Math.min(baseDay, 27), 18, 0, 0));
      const homeIsHost = HOSTS.has(home.id);

      fixtures.push({
        id: `G${group}-${mi + 1}`,
        stage: "Grupos",
        group,
        date: date.toISOString(),
        homeId: home.id,
        awayId: away.id,
        venue: VENUES[venueIdx % VENUES.length],
        neutral: !homeIsHost,
      });
      venueIdx++;
    });
  });

  return fixtures;
}

export const FIXTURES: Fixture[] = buildGroupFixtures();

export function getFixture(id: string): Fixture | undefined {
  return FIXTURES.find((f) => f.id === id);
}

export function fixturesByGroup(group: string): Fixture[] {
  return FIXTURES.filter((f) => f.group === group);
}

export function fixtureLabel(f: Fixture): string {
  const home = getTeam(f.homeId);
  const away = getTeam(f.awayId);
  return `${home.name} vs ${away.name}`;
}
