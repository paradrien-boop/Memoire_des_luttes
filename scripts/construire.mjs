// Assemble le dossier data/ en un seul fichier app/donnees.js, que l'application charge.
// Un fichier JavaScript (et pas du JSON) pour que l'app marche aussi ouverte directement
// depuis le disque, sans serveur ni réseau.
//
// Usage :
//   node scripts/construire.mjs              écrit app/donnees.js
//   node scripts/construire.mjs --verifier   échoue si app/donnees.js n'est pas à jour
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
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

const sortie = "// Fichier généré par scripts/construire.mjs à partir de data/. Ne pas modifier à la main.\n"
  + "window.MDL_DONNEES = " + JSON.stringify(donnees, null, 1) + ";\n";
const cible = join(racine, "app/donnees.js");

if (process.argv.includes("--verifier")) {
  const actuel = existsSync(cible) ? readFileSync(cible, "utf8") : "";
  if (actuel !== sortie) { console.log("✗ app/donnees.js n'est pas à jour. Lance : node scripts/construire.mjs"); process.exit(1); }
  console.log("app/donnees.js est à jour.");
} else {
  writeFileSync(cible, sortie);
  const n = donnees.packs.reduce((t, p) => t + p.cartes.length, 0);
  console.log(`app/donnees.js écrit : ${donnees.packs.length} pack(s), ${n} cartes, ${donnees.evenements.length} carte(s) d'événement.`);
}
