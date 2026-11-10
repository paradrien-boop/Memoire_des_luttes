// Vérifie les cartes de data/ : famille connue, champs obligatoires, liens valides.
// Usage : node scripts/valider.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const familles = JSON.parse(readFileSync(join(racine, "data/familles/familles.json"), "utf8"));
const RARETES = ["base", "rare", "legendaire"];
const STATUTS = ["proposee", "a-relire", "validee", "signee"];
let erreurs = 0;
const err = (f, m) => { erreurs++; console.log(`✗ ${f} : ${m}`); };
const vus = {}; // identifiant de carte -> pack, pour repérer les doublons entre packs

for (const type of ["officiel", "local"]) {
  const dossier = join(racine, "data/packs", type);
  if (!existsSync(dossier)) continue;
  for (const pack of readdirSync(dossier)) {
    const dp = join(dossier, pack);
    const meta = JSON.parse(readFileSync(join(dp, "pack.json"), "utf8"));
    const cartes = {};
    for (const f of readdirSync(join(dp, "cartes"))) cartes[f.replace(/\.json$/, "")] = JSON.parse(readFileSync(join(dp, "cartes", f), "utf8"));
    for (const [id, c] of Object.entries(cartes)) {
      const nom = `${pack}/${id}`;
      if (vus[id]) err(nom, `identifiant déjà utilisé dans le pack ${vus[id]}`);
      vus[id] = pack;
      if (!(meta.series || []).some(s => s.cartes.includes(id))) err(nom, "la carte n'est dans aucune série du pack, l'app ne l'affichera pas");
      if (c.id !== id) err(nom, `l'id "${c.id}" ne correspond pas au nom du fichier`);
      const fam = familles[c.fam];
      if (!fam) { err(nom, `famille inconnue "${c.fam}"`); continue; }
      if (fam.reserveeAuCollectif) err(nom, "famille réservée aux cartes d'événement");
      if (!RARETES.includes(c.rar)) err(nom, `rareté inconnue "${c.rar}"`);
      if (c.statut && !STATUTS.includes(c.statut)) err(nom, `statut inconnu "${c.statut}"`);
      for (const ch of fam.champs) {
        if (ch.obligatoire && !String(c[ch.cle] || "").trim()) err(nom, `rubrique obligatoire vide : ${ch.libelle}`);
        if (ch.max && String(c[ch.cle] || "").length > ch.max) err(nom, `${ch.libelle} dépasse ${ch.max} signes`);
      }
      for (const l of c.links || []) if (!cartes[l]) err(nom, `lien vers une carte inconnue : ${l}`);
      if (!c.src) err(nom, "aucune source");
    }
    for (const s of meta.series || []) for (const id of s.cartes) if (!cartes[id]) err(pack, `la série "${s.id}" cite une carte inconnue : ${id}`);
    console.log(`Pack ${pack} : ${Object.keys(cartes).length} cartes vérifiées.`);
  }
}
console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nAucune erreur.");
process.exit(erreurs ? 1 : 0);
