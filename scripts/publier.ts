// Assemble tout ce qui est publié sur Codeberg Pages dans le dossier publication/ :
//   /            le site
//   /app/        l'app
//   /packs/      les packs (forme exacte signée) et leur index, lus par « Chercher de nouveaux packs »
// À lancer après la construction de l'app et du site : npm run publier
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { packsPublies } from "./publies";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const sortie = join(racine, "publication");

for (const d of ["site/dist", "app/dist"]) if (!existsSync(join(racine, d))) throw new Error(`${d} manque : construis d'abord (npm run build && npm run build:site).`);

// Garde-fou : la clé de démonstration ne doit jamais être publiée.
const demo = JSON.parse(readFileSync(join(racine, "data/cles/demo.json"), "utf8")).publique as string;
const contient = (dossier: string): boolean => {
  return readdirSync(dossier).some((f) => {
    const p = join(dossier, f);
    return statSync(p).isDirectory() ? contient(p) : readFileSync(p, "latin1").includes(demo);
  });
};

rmSync(sortie, { recursive: true, force: true });
mkdirSync(join(sortie, "packs"), { recursive: true });
cpSync(join(racine, "site/dist"), sortie, { recursive: true });
cpSync(join(racine, "app/dist"), join(sortie, "app"), { recursive: true });
for (const f of ["LICENSE", "LICENCES.md"]) cpSync(join(racine, f), join(sortie, f));

const packs = packsPublies(racine);
for (const p of packs) {
  if (p.confiance === "invalide") throw new Error(`Le pack « ${p.nom} » a une signature invalide : re-signe-le avant de publier.`);
  writeFileSync(join(sortie, p.fichier), JSON.stringify(p.contenu) + "\n");
}
// L'index ne liste que des informations publiques ; l'app ne télécharge que les packs signés.
const index = { format: "memoire-des-luttes/index", version: 1, packs: packs.map(({ contenu, ...p }) => ({ ...p, signature: (contenu.signature as { valeur?: string } | null)?.valeur ?? null })) };
writeFileSync(join(sortie, "packs/index.json"), JSON.stringify(index, null, 1) + "\n");

if (contient(sortie)) throw new Error("La clé de démonstration se trouve dans la publication : publication annulée.");
console.log(`Publication prête dans publication/ : site, app, ${packs.length} pack(s).`);
