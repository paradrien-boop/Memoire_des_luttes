// Conversion des réponses de Wikipédia (résumé REST) et de Wikidata (entité) en brouillon de carte.
// Fonctions pures, testées sur des exemples (scripts/wikidata.test.ts).

export interface ResumeWikipedia {
  title: string;
  extract: string;
  description?: string;
  wikibase_item?: string;
  content_urls?: { desktop?: { page?: string } };
}

interface Valeur { datavalue?: { value: unknown } }
export interface EntiteWikidata { id: string; claims: Record<string, { mainsnak: Valeur }[]> }

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Une date Wikidata (« +1830-05-29T00:00:00Z », précision 9 = année, 10 = mois, 11 = jour) en français. */
export function dateFr(v: { time: string; precision: number }): string {
  const m = v.time.match(/^([+-])(\d+)-(\d\d)-(\d\d)/);
  if (!m) return "";
  const an = (m[1] === "-" ? "-" : "") + String(Number(m[2]));
  if (v.precision <= 9) return an;
  if (v.precision === 10) return `${MOIS[Number(m[3]) - 1]} ${an}`;
  return `${Number(m[4])}${m[4] === "01" ? "er" : ""} ${MOIS[Number(m[3]) - 1]} ${an}`;
}

const premier = (e: EntiteWikidata, p: string) => e.claims[p]?.[0]?.mainsnak.datavalue?.value;
const date = (e: EntiteWikidata, p: string) => { const v = premier(e, p) as { time: string; precision: number } | undefined; return v ? dateFr(v) : ""; };
const annee = (e: EntiteWikidata, p: string) => { const v = premier(e, p) as { time: string } | undefined; return v ? String(Number(v.time.slice(1, v.time.indexOf("-", 1)))) : ""; };
/** Les identifiants d'entités d'une propriété (pour en chercher les libellés). */
export const entites = (e: EntiteWikidata, p: string): string[] => (e.claims[p] ?? []).map((c) => (c.mainsnak.datavalue?.value as { id?: string } | undefined)?.id).filter((x): x is string => !!x);

/** Raccourcit un texte à la dernière phrase complète qui tient dans « max » signes. */
export function couper(texte: string, max: number): string {
  const t = texte.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const morceau = t.slice(0, max);
  const fin = Math.max(morceau.lastIndexOf(". "), morceau.lastIndexOf(" ; "));
  return fin > max / 3 ? morceau.slice(0, fin + 1) : morceau.slice(0, morceau.lastIndexOf(" ")) + "…";
}

/** Propriétés Wikidata utiles pour chaque famille. */
export const PROPRIETES_A_LIBELLER: Record<string, string[]> = {
  personnalite: ["P106"], evenement: ["P276"], lieu: ["P131"], livre: ["P50"], chant: ["P50", "P86", "P676"], courant: [], concept: [], mesure: [],
};

/**
 * Le brouillon de carte. « libelles » donne le nom français des entités citées (métiers, auteurs, lieux).
 * La rubrique « pourquoi » reste vide : le regard militant s'écrit à la main.
 */
export function brouillon(id: string, fam: string, r: ResumeWikipedia, e: EntiteWikidata | null, libelles: Record<string, string>): Record<string, unknown> {
  const noms = (p: string) => (e ? entites(e, p).map((q) => libelles[q]).filter(Boolean) : []);
  const carte: Record<string, unknown> = { id, fam, rar: "base", title: r.title };
  if (e) {
    if (fam === "personnalite") {
      const n = annee(e, "P569"), m = annee(e, "P570");
      if (n) carte.dates = m ? `${n} – ${m}` : `${n} –`;
      const metiers = noms("P106").slice(0, 2);
      if (metiers.length) carte.role = metiers.join(", ");
    } else if (fam === "evenement") {
      const debut = date(e, "P580"), fin = date(e, "P582"), point = date(e, "P585");
      carte.dates = point || (debut && fin ? `${debut} – ${fin}` : debut);
      const lieux = noms("P276");
      if (lieux.length) carte.lieu = lieux[0];
    } else if (fam === "livre") {
      const a = noms("P50");
      if (a.length) carte.auteur = a.join(", ");
      carte.dates = annee(e, "P577");
    } else if (fam === "chant") {
      const a = [...new Set([...noms("P50"), ...noms("P676"), ...noms("P86")])];
      if (a.length) carte.auteur = a.join(" / ");
      carte.dates = annee(e, "P577");
    } else if (fam === "lieu") {
      const v = noms("P131");
      if (v.length) carte.adresse = v[0];
    } else {
      const d = annee(e, "P571");
      if (d) carte.dates = d;
    }
    if (!carte.dates) delete carte.dates;
  }
  carte.fait = couper(r.extract, 560);
  carte.pourquoi = "";
  const sources = [`Wikipédia (CC BY-SA), texte à réécrire : ${r.content_urls?.desktop?.page ?? r.title}`];
  if (e) sources.push(`Wikidata ${e.id} (CC0)`);
  carte.src = sources.join(" ; ");
  carte.statut = "proposee";
  return carte;
}
