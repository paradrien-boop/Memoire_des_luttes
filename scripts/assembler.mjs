// Rassemble le dossier data/ en un seul objet.
// Utilisé par scripts/construire.mjs (pour le prototype) et par la configuration Vite de l'app.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export function assembler(racine) {
  const lire = (...p) => JSON.parse(readFileSync(join(racine, ...p), "utf8"));
  const jsons = dossier => existsSync(dossier) ? readdirSync(dossier).filter(f => f.endsWith(".json")).sort() : [];
  const donnees = { familles: lire("data/familles/familles.json"), packs: [], evenements: [] };
  for (const type of ["officiel", "local"]) {
    const dossier = join(racine, "data/packs", type);
    if (!existsSync(dossier)) continue;
    for (const pack of readdirSync(dossier).sort()) {
      const meta = lire("data/packs", type, pack, "pack.json");
      const cartes = jsons(join(dossier, pack, "cartes")).map(f => lire("data/packs", type, pack, "cartes", f));
      donnees.packs.push({ type, ...meta, cartes });
    }
  }
  for (const f of jsons(join(racine, "data/evenements"))) donnees.evenements.push(lire("data/evenements", f));
  // Seulement les clés publiques du collectif. La clé de démonstration n'est jamais incluse ici.
  donnees.cles = lire("data/cles/racine.json");
  return donnees;
}
