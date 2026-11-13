// Exporte les dessins actuels de l'app en fichiers SVG, chacun dans le cadre de son gabarit :
// data/dessins/modeles/<nom>.svg. Une illustratrice ou un illustrateur peut les ouvrir (Inkscape, Illustrator…),
// les redessiner, puis les enregistrer sous le même nom dans data/dessins/ pour remplacer le dessin.
//
// Il faut le serveur de développement de l'app lancé (npm run dev) et Playwright installé :
//   node scripts/exporter-dessins.mjs [adresse du serveur, par défaut http://localhost:5173/]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const adresse = process.argv[2] ?? "http://localhost:5173/";
const sortie = join(racine, "data/dessins/modeles");

const nettoyer = (svg) => svg
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/ class="[^"]*"/g, "")
  .replace(/ style="[^"]*"/g, "")
  .replace(/ aria-[a-z]+="[^"]*"/g, "")
  .replace(/ (role|tabindex|data-nom)="[^"]*"/g, "");

const navigateur = await chromium.launch();
const page = await navigateur.newPage();
await page.goto(adresse);
const commencer = page.getByRole("button", { name: "C'est parti" });
if (await commencer.isVisible().catch(() => false)) await commencer.click();
await page.goto(adresse + "#dessins-export");
await page.waitForSelector("[data-nom]");
await page.emulateMedia({ reducedMotion: "reduce" });
const dessins = await page.evaluate(() => [
  ...[...document.querySelectorAll("svg[data-nom]")].map((s) => ({ nom: s.dataset.nom, svg: s.outerHTML })),
  ...[...document.querySelectorAll("div[data-scene]")].map((d) => ({ nom: d.dataset.scene, svg: d.querySelector("svg").outerHTML })),
]);
for (const { nom, svg } of dessins) {
  const fichier = join(sortie, `${nom}.svg`);
  mkdirSync(dirname(fichier), { recursive: true });
  const propre = nettoyer(svg).replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/xmlns="http:\/\/www.w3.org\/2000\/svg" (.*?)xmlns="http:\/\/www.w3.org\/2000\/svg"/, 'xmlns="http://www.w3.org/2000/svg" $1');
  writeFileSync(fichier, '<?xml version="1.0" encoding="UTF-8"?>\n' + propre + "\n");
}
await navigateur.close();
console.log(`${dessins.length} modèles écrits dans data/dessins/modeles/.`);
