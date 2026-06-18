import type { Team } from "@/lib/model/types";

// ===========================================================================
// 48 selecciones del Mundial 2026 repartidas en 12 grupos (A-L).
// Los ratings (attack/defense/form) son una linea base editable. attack > 1
// significa que el equipo marca mas que el promedio; defense < 1 significa que
// concede menos. Cuando conectes API-Football, el cron recalcula estos valores.
// ===========================================================================

export const TEAMS: Team[] = [
  // ---------------- Grupo A ----------------
  mk("mex", "Mexico", "mex", "A", 14, 1.18, 0.95, 1.04, 2.1, 5.4, [
    p("S. Gimenez", 1.0, "DEL"),
    p("H. Lozano", 0.8, "DEL"),
    p("E. Alvarez", 0.4, "MED"),
  ]),
  mk("can", "Canada", "can", "A", 30, 1.06, 1.02, 1.02, 2.3, 4.8, [
    p("J. David", 1.0, "DEL"),
    p("A. Davies", 0.6, "DEF"),
    p("C. Larin", 0.5, "DEL"),
  ]),
  mk("mar", "Marruecos", "mar", "A", 12, 1.16, 0.88, 1.06, 2.2, 5.2, [
    p("Y. En-Nesyri", 1.0, "DEL"),
    p("H. Ziyech", 0.7, "MED"),
    p("B. Diaz", 0.6, "MED"),
  ]),
  mk("jpn", "Japon", "jpn", "A", 17, 1.12, 0.92, 1.05, 1.6, 5.0, [
    p("K. Mitoma", 0.9, "DEL"),
    p("T. Kubo", 0.8, "MED"),
    p("A. Ueda", 0.7, "DEL"),
  ]),

  // ---------------- Grupo B ----------------
  mk("usa", "Estados Unidos", "usa", "B", 16, 1.14, 0.96, 1.05, 2.0, 5.3, [
    p("C. Pulisic", 1.0, "DEL"),
    p("R. Aaronson", 0.6, "MED"),
    p("F. Balogun", 0.6, "DEL"),
  ]),
  mk("sui", "Suiza", "che", "B", 19, 1.05, 0.9, 1.0, 2.1, 4.7, [
    p("B. Embolo", 0.9, "DEL"),
    p("X. Shaqiri", 0.7, "MED"),
    p("R. Vargas", 0.6, "DEL"),
  ]),
  mk("sen", "Senegal", "sen", "B", 18, 1.12, 0.9, 1.02, 2.4, 5.1, [
    p("S. Mane", 1.0, "DEL"),
    p("N. Jackson", 0.7, "DEL"),
    p("I. Sarr", 0.6, "DEL"),
  ]),
  mk("kor", "Corea del Sur", "kor", "B", 22, 1.08, 0.98, 1.03, 1.9, 4.9, [
    p("Son Heung-min", 1.0, "DEL"),
    p("Lee Kang-in", 0.7, "MED"),
    p("Hwang Hee-chan", 0.6, "DEL"),
  ]),

  // ---------------- Grupo C ----------------
  mk("arg", "Argentina", "arg", "C", 1, 1.32, 0.78, 1.08, 2.3, 5.6, [
    p("L. Messi", 1.0, "DEL"),
    p("J. Alvarez", 0.95, "DEL"),
    p("L. Martinez", 0.85, "DEL"),
  ]),
  mk("aus", "Australia", "aus", "C", 24, 1.0, 1.02, 1.0, 2.2, 4.6, [
    p("M. Duke", 0.8, "DEL"),
    p("A. Irvine", 0.6, "MED"),
    p("R. McGree", 0.5, "MED"),
  ]),
  mk("pol", "Polonia", "pol", "C", 28, 1.04, 1.0, 0.98, 2.3, 4.8, [
    p("R. Lewandowski", 1.0, "DEL"),
    p("P. Zielinski", 0.6, "MED"),
    p("K. Swiderski", 0.5, "DEL"),
  ]),
  mk("nga", "Nigeria", "nga", "C", 25, 1.1, 0.96, 1.01, 2.5, 5.0, [
    p("V. Osimhen", 1.0, "DEL"),
    p("A. Lookman", 0.8, "DEL"),
    p("S. Chukwueze", 0.6, "DEL"),
  ]),

  // ---------------- Grupo D ----------------
  mk("fra", "Francia", "fra", "D", 2, 1.34, 0.76, 1.07, 2.2, 5.7, [
    p("K. Mbappe", 1.0, "DEL"),
    p("O. Dembele", 0.7, "DEL"),
    p("M. Thuram", 0.65, "DEL"),
  ]),
  mk("cro", "Croacia", "hrv", "D", 10, 1.1, 0.88, 1.0, 2.1, 5.1, [
    p("A. Kramaric", 0.9, "DEL"),
    p("L. Modric", 0.5, "MED"),
    p("L. Majer", 0.5, "MED"),
  ]),
  mk("civ", "Costa de Marfil", "civ", "D", 40, 1.06, 1.0, 1.02, 2.6, 4.9, [
    p("S. Haller", 0.9, "DEL"),
    p("N. Pepe", 0.7, "DEL"),
    p("F. Kessie", 0.5, "MED"),
  ]),
  mk("sco", "Escocia", "sco", "D", 39, 1.0, 1.0, 0.99, 2.3, 4.7, [
    p("C. Adams", 0.8, "DEL"),
    p("J. McGinn", 0.6, "MED"),
    p("S. McTominay", 0.6, "MED"),
  ]),

  // ---------------- Grupo E ----------------
  mk("esp", "Espana", "esp", "E", 3, 1.3, 0.8, 1.08, 1.9, 5.8, [
    p("N. Williams", 0.85, "DEL"),
    p("A. Morata", 0.85, "DEL"),
    p("Lamine Yamal", 0.8, "DEL"),
  ]),
  mk("uru", "Uruguay", "ury", "E", 11, 1.15, 0.86, 1.04, 2.5, 5.2, [
    p("D. Nunez", 0.95, "DEL"),
    p("F. Valverde", 0.6, "MED"),
    p("M. Araujo", 0.4, "DEF"),
  ]),
  mk("egy", "Egipto", "egy", "E", 33, 1.06, 0.96, 1.01, 2.3, 4.8, [
    p("M. Salah", 1.0, "DEL"),
    p("O. Marmoush", 0.7, "DEL"),
    p("T. Trezeguet", 0.5, "DEL"),
  ]),
  mk("nzl", "Nueva Zelanda", "nzl", "E", 95, 0.86, 1.12, 0.98, 2.0, 4.0, [
    p("C. Wood", 0.9, "DEL"),
    p("M. Stamenic", 0.4, "MED"),
    p("E. Just", 0.4, "DEL"),
  ]),

  // ---------------- Grupo F ----------------
  mk("bra", "Brasil", "bra", "F", 5, 1.3, 0.8, 1.05, 2.2, 5.7, [
    p("Vinicius Jr", 1.0, "DEL"),
    p("Rodrygo", 0.75, "DEL"),
    p("Raphinha", 0.7, "DEL"),
  ]),
  mk("col", "Colombia", "col", "F", 13, 1.16, 0.88, 1.06, 2.4, 5.2, [
    p("L. Diaz", 0.95, "DEL"),
    p("J. Rodriguez", 0.7, "MED"),
    p("J. Cordoba", 0.6, "DEL"),
  ]),
  mk("irn", "Iran", "irn", "F", 20, 1.04, 0.94, 1.0, 2.2, 4.7, [
    p("M. Taremi", 1.0, "DEL"),
    p("S. Azmoun", 0.8, "DEL"),
    p("A. Jahanbakhsh", 0.5, "MED"),
  ]),
  mk("gha", "Ghana", "gha", "F", 68, 0.98, 1.04, 0.99, 2.5, 4.6, [
    p("I. Williams", 0.8, "DEL"),
    p("M. Kudus", 0.85, "MED"),
    p("J. Ayew", 0.5, "DEL"),
  ]),

  // ---------------- Grupo G ----------------
  mk("eng", "Inglaterra", "eng", "G", 4, 1.3, 0.79, 1.06, 2.0, 5.6, [
    p("H. Kane", 1.0, "DEL"),
    p("B. Saka", 0.75, "DEL"),
    p("J. Bellingham", 0.7, "MED"),
  ]),
  mk("ecu", "Ecuador", "ecu", "G", 23, 1.06, 0.9, 1.03, 2.6, 4.9, [
    p("E. Valencia", 1.0, "DEL"),
    p("K. Rodriguez", 0.6, "MED"),
    p("G. Plata", 0.5, "DEL"),
  ]),
  mk("svn", "Eslovenia", "svn", "G", 49, 0.98, 0.98, 1.0, 2.2, 4.5, [
    p("B. Sesko", 0.95, "DEL"),
    p("A. Sporar", 0.5, "DEL"),
    p("J. Ilicic", 0.4, "MED"),
  ]),
  mk("qat", "Catar", "qat", "G", 37, 0.96, 1.02, 0.99, 2.1, 4.4, [
    p("A. Ali", 0.85, "DEL"),
    p("A. Afif", 0.8, "MED"),
    p("H. Al-Haydos", 0.4, "MED"),
  ]),

  // ---------------- Grupo H ----------------
  mk("por", "Portugal", "prt", "H", 6, 1.3, 0.82, 1.06, 2.2, 5.6, [
    p("C. Ronaldo", 0.95, "DEL"),
    p("R. Leao", 0.8, "DEL"),
    p("B. Fernandes", 0.7, "MED"),
  ]),
  mk("ksa", "Arabia Saudi", "sau", "H", 56, 0.94, 1.04, 0.99, 2.3, 4.4, [
    p("S. Al-Dawsari", 0.9, "DEL"),
    p("F. Al-Brikan", 0.6, "DEL"),
    p("M. Kanno", 0.4, "MED"),
  ]),
  mk("tur", "Turquia", "tur", "H", 27, 1.08, 0.96, 1.03, 2.6, 5.0, [
    p("A. Yildiz", 0.85, "DEL"),
    p("A. Guler", 0.7, "MED"),
    p("B. Yilmaz", 0.55, "DEL"),
  ]),
  mk("pan", "Panama", "pan", "H", 41, 0.96, 1.02, 1.01, 2.5, 4.5, [
    p("J. Carrasquilla", 0.7, "MED"),
    p("I. Fajardo", 0.6, "DEL"),
    p("C. Tanner", 0.5, "DEL"),
  ]),

  // ---------------- Grupo I ----------------
  mk("ned", "Paises Bajos", "nld", "I", 7, 1.26, 0.83, 1.05, 2.0, 5.5, [
    p("M. Depay", 0.9, "DEL"),
    p("C. Gakpo", 0.8, "DEL"),
    p("X. Simons", 0.65, "MED"),
  ]),
  mk("ger", "Alemania", "deu", "I", 9, 1.26, 0.85, 1.05, 2.1, 5.6, [
    p("K. Havertz", 0.85, "DEL"),
    p("J. Musiala", 0.8, "MED"),
    p("F. Wirtz", 0.75, "MED"),
  ]),
  mk("mli", "Mali", "mli", "I", 48, 1.0, 1.0, 1.01, 2.6, 4.7, [
    p("E. Nene Dorgeles", 0.7, "DEL"),
    p("A. Doumbia", 0.6, "MED"),
    p("K. Kone", 0.5, "MED"),
  ]),
  mk("cri", "Costa Rica", "cri", "I", 52, 0.94, 1.02, 0.99, 2.2, 4.4, [
    p("M. Ugalde", 0.7, "MED"),
    p("J. Campbell", 0.6, "DEL"),
    p("A. Contreras", 0.5, "DEL"),
  ]),

  // ---------------- Grupo J ----------------
  mk("bel", "Belgica", "bel", "J", 8, 1.24, 0.86, 1.04, 2.1, 5.4, [
    p("R. Lukaku", 0.95, "DEL"),
    p("K. De Bruyne", 0.75, "MED"),
    p("J. Doku", 0.65, "DEL"),
  ]),
  mk("den", "Dinamarca", "dnk", "J", 21, 1.1, 0.9, 1.02, 2.0, 5.0, [
    p("R. Hojlund", 0.9, "DEL"),
    p("C. Eriksen", 0.6, "MED"),
    p("A. Isaksen", 0.5, "DEL"),
  ]),
  mk("tun", "Tunez", "tun", "J", 41, 0.98, 1.0, 1.0, 2.5, 4.6, [
    p("Y. Msakni", 0.7, "MED"),
    p("E. Ben Romdhane", 0.6, "MED"),
    p("S. Jebali", 0.5, "DEL"),
  ]),
  mk("nor", "Noruega", "nor", "J", 26, 1.16, 0.92, 1.05, 2.0, 5.1, [
    p("E. Haaland", 1.0, "DEL"),
    p("M. Odegaard", 0.65, "MED"),
    p("A. Sorloth", 0.6, "DEL"),
  ]),

  // ---------------- Grupo K ----------------
  mk("ita", "Italia", "ita", "K", 15, 1.18, 0.84, 1.03, 2.2, 5.3, [
    p("G. Scamacca", 0.8, "DEL"),
    p("F. Chiesa", 0.7, "DEL"),
    p("N. Barella", 0.55, "MED"),
  ]),
  mk("per", "Peru", "per", "K", 47, 0.92, 1.02, 0.98, 2.5, 4.5, [
    p("G. Lapadula", 0.8, "DEL"),
    p("A. Carrillo", 0.6, "DEL"),
    p("E. Flores", 0.5, "MED"),
  ]),
  mk("svk", "Eslovaquia", "svk", "K", 45, 0.98, 0.98, 1.0, 2.3, 4.6, [
    p("R. Bozenik", 0.7, "DEL"),
    p("L. Haraslin", 0.6, "DEL"),
    p("S. Lobotka", 0.4, "MED"),
  ]),
  mk("rsa", "Sudafrica", "zaf", "K", 58, 0.92, 1.02, 1.0, 2.5, 4.4, [
    p("L. Mokoena", 0.6, "MED"),
    p("E. Zwane", 0.6, "DEL"),
    p("P. Tau", 0.6, "DEL"),
  ]),

  // ---------------- Grupo L ----------------
  mk("aut", "Austria", "aut", "L", 22, 1.12, 0.9, 1.04, 2.2, 5.0, [
    p("M. Arnautovic", 0.8, "DEL"),
    p("M. Sabitzer", 0.65, "MED"),
    p("C. Baumgartner", 0.6, "MED"),
  ]),
  mk("par", "Paraguay", "pry", "L", 50, 0.94, 1.0, 1.01, 2.6, 4.5, [
    p("A. Sanabria", 0.8, "DEL"),
    p("J. Enciso", 0.6, "MED"),
    p("M. Almiron", 0.6, "MED"),
  ]),
  mk("cmr", "Camerun", "cmr", "L", 53, 1.0, 1.02, 1.0, 2.7, 4.7, [
    p("V. Aboubakar", 0.8, "DEL"),
    p("B. Choupo-Moting", 0.6, "DEL"),
    p("K. Toko Ekambi", 0.5, "DEL"),
  ]),
  mk("uzb", "Uzbekistan", "uzb", "L", 57, 0.94, 1.0, 1.02, 2.3, 4.5, [
    p("E. Shomurodov", 0.85, "DEL"),
    p("O. Zukhriddin", 0.5, "MED"),
    p("A. Masharipov", 0.5, "MED"),
  ]),
];

// Helpers concisos para declarar equipos y jugadores.
function mk(
  id: string,
  name: string,
  code: string,
  group: string,
  fifaRank: number,
  attack: number,
  defense: number,
  form: number,
  cardsAvg: number,
  cornersAvg: number,
  squad: Team["squad"],
): Team {
  return {
    id,
    name,
    code,
    group,
    fifaRank,
    attack,
    defense,
    form,
    cardsAvg,
    cornersAvg,
    squad,
  };
}

function p(name: string, goalWeight: number, position: Team["squad"][number]["position"]) {
  return { name, goalWeight, position };
}

// Acceso rapido por id.
export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export function getTeam(id: string): Team {
  const team = TEAMS_BY_ID[id];
  if (!team) throw new Error(`Equipo no encontrado: ${id}`);
  return team;
}

export const GROUPS: string[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export function teamsInGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group).sort(
    (a, b) => a.fifaRank - b.fifaRank,
  );
}
