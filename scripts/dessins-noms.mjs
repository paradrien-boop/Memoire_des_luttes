// Les règles des dessins déposés, communes à npm run valider (scripts/dessins.mjs) et à l'atelier de dessin
// (app/atelier.html) : noms autorisés, cadres, taille maximale, sécurité des SVG. Sans dépendance à Node.

const OBJETS = ["porte-voix", "accordeon", "tambour", "banderole", "pancarte", "bonnet-phrygien", "livre", "journal", "binocles", "foulard-rouge", "tablier", "fichu", "casquette", "bleu-de-chauffe", "sac-de-tracts", "lunettes", "lavalliere", "rose", "drapeau", "beret", "cocarde", "lanterne", "echarpe", "mariniere"];
const ENNEMIS = ["soldat", "proprietaire", "patron", "censeur", "mouchard", "general"];
const FAMILLES = ["personnalite", "evenement", "lieu", "mesure", "concept", "courant", "livre", "chant"];
const POSES = ["", "-victoire", "-sonne"];

/** Le cadre de chaque type de dessin, en unités du dessin : x, y, largeur, hauteur (le point 0,0 est au sol). */
export const CADRES = {
  personnage: { x: -60, y: -170, l: 120, h: 180 },
  ennemis: { x: -60, y: -170, l: 120, h: 180 },
  chat: { x: -70, y: -130, l: 140, h: 140 },
  quartier: { x: 0, y: 0, l: 400, h: 300 },
};

/** Tous les noms de dessins possibles (sans extension). */
export function nomsPossibles() {
  const noms = [];
  for (const c of [0, 1, 2]) for (const p of POSES) noms.push(`personnage/base-${c}${p}`);
  for (const o of OBJETS) for (const p of ["", "-victoire"]) noms.push(`personnage/objets/${o}${p}`);
  for (const e of ENNEMIS) for (const p of ["", "-fuite"]) noms.push(`ennemis/${e}${p}`);
  for (let s = 0; s <= 4; s++) for (const p of ["", "-endormi"]) noms.push(`chat/stade-${s}${p}`);
  noms.push("quartier/fond", "quartier/fond-nuit");
  for (const f of FAMILLES) for (const n of [1, 2, 3]) noms.push(`quartier/${f}-${n}`);
  return noms;
}

/** Taille maximale d'un dessin (les dessins sont inclus dans l'app : elle doit rester légère). */
export const TAILLE_MAX = 300 * 1024;


/** Pourquoi un SVG est refusé, ou null s'il est accepté. */
export function refusSvg(texte) {
  if (!/<svg[\s>]/.test(texte)) return "ce n'est pas un fichier SVG";
  if (/<script|\son\w+\s*=|href\s*=\s*["']\s*(https?:|javascript:)/i.test(texte)) return "contient du script ou un lien vers l'extérieur, refusé";
  if (/<image[\s>]/i.test(texte) && /href\s*=\s*["'](?!data:|#)/i.test(texte)) return "les images doivent être intégrées au fichier, pas liées";
  return null;
}

/**
 * Retrouve le nom d'un dessin à partir d'un chemin ou d'un simple nom de fichier :
 * « dessins/ennemis/censeur.svg », « ennemis/censeur.svg » ou « censeur.svg » donnent « ennemis/censeur ».
 */
export function nomDepuisFichier(chemin) {
  const sansExt = chemin.replace(/\\/g, "/").replace(/\.(svg|png)$/i, "");
  const noms = nomsPossibles();
  const parties = sansExt.split("/");
  for (let i = 0; i < parties.length; i++) {
    const n = parties.slice(i).join("/");
    if (noms.includes(n)) return n;
  }
  const dernier = parties[parties.length - 1];
  const candidats = noms.filter((n) => n.split("/").pop() === dernier);
  return candidats.length === 1 ? candidats[0] : null;
}
