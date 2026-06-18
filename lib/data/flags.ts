// Mapeo de id de equipo -> codigo ISO alpha-2 para banderas (flagcdn.com).
// Inglaterra y Escocia usan los subcodigos gb-eng / gb-sct.

const ALPHA2: Record<string, string> = {
  mex: "mx", can: "ca", mar: "ma", jpn: "jp",
  usa: "us", sui: "ch", sen: "sn", kor: "kr",
  arg: "ar", aus: "au", pol: "pl", nga: "ng",
  fra: "fr", cro: "hr", civ: "ci", sco: "gb-sct",
  esp: "es", uru: "uy", egy: "eg", nzl: "nz",
  bra: "br", col: "co", irn: "ir", gha: "gh",
  eng: "gb-eng", ecu: "ec", svn: "si", qat: "qa",
  por: "pt", ksa: "sa", tur: "tr", pan: "pa",
  ned: "nl", ger: "de", mli: "ml", cri: "cr",
  bel: "be", den: "dk", tun: "tn", nor: "no",
  ita: "it", per: "pe", svk: "sk", rsa: "za",
  aut: "at", par: "py", cmr: "cm", uzb: "uz",
};

export function flagUrl(teamId: string, width: 20 | 40 | 80 | 160 = 40): string {
  const code = ALPHA2[teamId] ?? "un";
  return `https://flagcdn.com/w${width}/${code}.png`;
}
