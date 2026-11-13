// Les dessins déposés dans data/dessins/ (SVG, ou PNG à fond transparent) : leurs noms autorisés,
// leur cadre (gabarit), et leur lecture. Utilisé par la configuration Vite de l'app et par npm run valider.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { CADRES, nomsPossibles, refusSvg, TAILLE_MAX } from "./dessins-noms.mjs";
export { CADRES, nomsPossibles, TAILLE_MAX };

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
      const refus = refusSvg(texte);
      if (refus) { problemes.push(`${rel} : ${refus}`); continue; }
      dessins[nom] = { type: "svg", contenu: texte };
    } else {
      dessins[nom] = { type: "png", contenu: readFileSync(chemin).toString("base64") };
    }
  }
  return { dessins, problemes };
}
