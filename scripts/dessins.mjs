// Les dessins déposés dans data/dessins/ (SVG, ou PNG à fond transparent) : leurs noms autorisés,
// leur cadre (gabarit), et leur lecture. Utilisé par la configuration Vite de l'app et par npm run valider.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

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

function fichiers(dossier) {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier).flatMap((f) => {
    const p = join(dossier, f);
    return statSync(p).isDirectory() ? (f === "gabarits" || f === "modeles" ? [] : fichiers(p)) : [p];
  });
}

/**
 * Les dessins déposés, prêts à être inclus dans l'app : { "chat/stade-2": { type: "svg", contenu: "<svg…" } }.
 * @returns aussi les problèmes trouvés (noms inconnus, formats, tailles), pour npm run valider.
 */
export function lireDessins(racine) {
  const base = join(racine, "data/dessins");
  const possibles = new Set(nomsPossibles());
  const dessins = {};
  const problemes = [];
  for (const chemin of fichiers(base)) {
    const rel = relative(base, chemin).split(sep).join("/");
    if (rel.endsWith(".gitkeep") || rel.endsWith(".md")) continue;
    const m = rel.match(/^(.*)\.(svg|png)$/i);
    if (!m) { problemes.push(`${rel} : format non pris en charge (SVG ou PNG seulement)`); continue; }
    const [, nom, ext] = m;
    if (!possibles.has(nom)) { problemes.push(`${rel} : nom inconnu (voir data/dessins/README.md pour la liste des noms)`); continue; }
    const taille = statSync(chemin).size;
    if (taille > TAILLE_MAX) { problemes.push(`${rel} : trop lourd (${Math.round(taille / 1024)} Ko, ${TAILLE_MAX / 1024} Ko au plus)`); continue; }
    if (ext.toLowerCase() === "svg") {
      const texte = readFileSync(chemin, "utf8");
      if (!/<svg[\s>]/.test(texte)) { problemes.push(`${rel} : ce n'est pas un fichier SVG`); continue; }
      if (/<script|\son\w+\s*=|href\s*=\s*["']\s*(https?:|javascript:)/i.test(texte)) { problemes.push(`${rel} : contient du script ou un lien vers l'extérieur, refusé`); continue; }
      if (/<image[\s>]/i.test(texte) && /href\s*=\s*["'](?!data:|#)/i.test(texte)) { problemes.push(`${rel} : les images doivent être intégrées au fichier, pas liées`); continue; }
      dessins[nom] = { type: "svg", contenu: texte };
    } else {
      dessins[nom] = { type: "png", contenu: readFileSync(chemin).toString("base64") };
    }
  }
  return { dessins, problemes };
}
