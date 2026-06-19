import type { Team } from "@/lib/model/types";
import { TEAMS } from "@/lib/data/teams";

// ===========================================================================
// Conecta el nombre real que devuelve API-Football (en ingles) con un equipo
// de nuestro modelo, para poder calcular predicciones sobre partidos reales.
// Si el equipo no esta en el modelo, devuelve uno generico con ratings neutros.
// ===========================================================================

const NAME_TO_ID: Record<string, string> = {
  mexico: "mex",
  canada: "can",
  morocco: "mar",
  japan: "jpn",
  usa: "usa",
  "united states": "usa",
  switzerland: "sui",
  senegal: "sen",
  "south korea": "kor",
  "korea republic": "kor",
  argentina: "arg",
  australia: "aus",
  poland: "pol",
  nigeria: "nga",
  france: "fra",
  croatia: "cro",
  "ivory coast": "civ",
  "cote divoire": "civ",
  scotland: "sco",
  spain: "esp",
  uruguay: "uru",
  egypt: "egy",
  "new zealand": "nzl",
  brazil: "bra",
  colombia: "col",
  iran: "irn",
  ghana: "gha",
  england: "eng",
  ecuador: "ecu",
  slovenia: "svn",
  qatar: "qat",
  portugal: "por",
  "saudi arabia": "ksa",
  turkey: "tur",
  turkiye: "tur",
  panama: "pan",
  netherlands: "ned",
  germany: "ger",
  mali: "mli",
  "costa rica": "cri",
  belgium: "bel",
  denmark: "den",
  tunisia: "tun",
  norway: "nor",
  italy: "ita",
  peru: "per",
  slovakia: "svk",
  "south africa": "rsa",
  austria: "aut",
  paraguay: "par",
  cameroon: "cmr",
  uzbekistan: "uzb",
};

const BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ResolvedTeam {
  team: Team;
  known: boolean;
}

export function resolveTeam(apiName: string): ResolvedTeam {
  const id = NAME_TO_ID[norm(apiName)];
  if (id && BY_ID[id]) return { team: BY_ID[id], known: true };

  // Equipo generico con ratings neutros (no esta en el modelo).
  return {
    team: {
      id: `x-${norm(apiName).replace(/ /g, "-")}`,
      name: apiName,
      code: "",
      group: "",
      fifaRank: 48,
      attack: 1.0,
      defense: 1.0,
      form: 1.0,
      cardsAvg: 2.3,
      cornersAvg: 4.8,
      squad: [],
    },
    known: false,
  };
}
