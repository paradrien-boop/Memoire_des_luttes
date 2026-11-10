// Assemble le dossier data/ en un seul fichier prototype/donnees.js, que le prototype charge.
// (La nouvelle app, elle, lit data/ directement au moment du build.)
//
// Usage :
//   node scripts/construire.mjs              écrit prototype/donnees.js
//   node scripts/construire.mjs --verifier   échoue si prototype/donnees.js n'est pas à jour
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assembler } from "./assembler.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const donnees = assembler(racine);
const sortie = "// Fichier généré par scripts/construire.mjs à partir de data/. Ne pas modifier à la main.\n"
  + "window.MDL_DONNEES = " + JSON.stringify(donnees, null, 1) + ";\n";
const cible = join(racine, "prototype/donnees.js");

if (process.argv.includes("--verifier")) {
  const actuel = existsSync(cible) ? readFileSync(cible, "utf8") : "";
  if (actuel !== sortie) { console.log("✗ prototype/donnees.js n'est pas à jour. Lance : node scripts/construire.mjs"); process.exit(1); }
  console.log("prototype/donnees.js est à jour.");
} else {
  writeFileSync(cible, sortie);
  const n = donnees.packs.reduce((t, p) => t + p.cartes.length, 0);
  console.log(`prototype/donnees.js écrit : ${donnees.packs.length} pack(s), ${n} cartes, ${donnees.evenements.length} carte(s) d'événement.`);
}
