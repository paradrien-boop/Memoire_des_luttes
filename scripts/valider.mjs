// Vérifie les cartes de data/ : famille connue, champs obligatoires, liens valides.
// Usage : node scripts/valider.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifierDelegation, verifierPack } from "../paquets/noyau/src/index.ts";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const familles = JSON.parse(readFileSync(join(racine, "data/familles/familles.json"), "utf8"));
const RARETES = ["base", "rare", "legendaire"];
const STATUTS = ["proposee", "a-relire", "validee", "signee"];
let erreurs = 0;
const err = (f, m) => { erreurs++; console.log(`✗ ${f} : ${m}`); };
const vus = {}; // identifiant de carte -> pack, pour repérer les doublons entre packs

// Clés du collectif : seulement des clés publiques (64 caractères hexadécimaux), jamais de clé secrète.
const cles = JSON.parse(readFileSync(join(racine, "data/cles/racine.json"), "utf8"));
if (!Array.isArray(cles.racines) || cles.racines.some((k) => !/^[0-9a-f]{64}$/.test(k))) err("data/cles/racine.json", "« racines » doit être une liste de clés publiques (64 caractères hexadécimaux)");
if (cles.revocations !== undefined && (!Array.isArray(cles.revocations) || cles.revocations.some((k) => !/^[0-9a-f]{64}$/.test(k)))) err("data/cles/racine.json", "« revocations » doit être une liste de clés publiques");
if (JSON.stringify(cles).includes("secrete")) err("data/cles/racine.json", "ce fichier ne doit contenir aucune clé secrète");

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
      // Questions écrites pour le quiz du jour (facultatives)
      if (c.questions !== undefined) {
        if (!Array.isArray(c.questions)) err(nom, "« questions » doit être une liste");
        else c.questions.forEach((q, i) => {
          const ici = `${nom} question ${i + 1}`;
          if (!q || typeof q.q !== "string" || !q.q.trim()) err(ici, "énoncé « q » manquant");
          if (typeof q?.bonne !== "string" || !q.bonne.trim()) err(ici, "bonne réponse « bonne » manquante");
          if (!Array.isArray(q?.fausses) || q.fausses.filter(f => typeof f === "string" && f.trim()).length < 3) err(ici, "il faut au moins 3 mauvaises réponses dans « fausses »");
          else if (new Set([q.bonne, ...q.fausses].map(x => String(x).toLowerCase())).size !== q.fausses.length + 1) err(ici, "des réponses sont en double");
        });
      }
    }
    for (const s of meta.series || []) for (const id of s.cartes) if (!cartes[id]) err(pack, `la série "${s.id}" cite une carte inconnue : ${id}`);
    // Adversaires des batailles du quiz (ennemis.json, facultatif)
    if (existsSync(join(dp, "ennemis.json"))) {
      const ennemis = JSON.parse(readFileSync(join(dp, "ennemis.json"), "utf8"));
      const DESSINS = ["soldat", "proprietaire", "patron", "censeur", "mouchard", "general"];
      if (!Array.isArray(ennemis)) err(`${pack}/ennemis.json`, "doit être une liste");
      else for (const e of ennemis) {
        const nom = `${pack}/ennemis.json ${e?.id ?? "?"}`;
        for (const champ of ["id", "nom", "epoque", "description", "replique", "defaite"]) if (typeof e?.[champ] !== "string" || !e[champ].trim()) err(nom, `champ « ${champ} » manquant`);
        if (!DESSINS.includes(e?.dessin)) err(nom, `dessin inconnu « ${e?.dessin} » (dessins : ${DESSINS.join(", ")})`);
        if (!Array.isArray(e?.familles) || e.familles.some((f) => !familles[f])) err(nom, "« familles » doit lister des familles existantes");
        if (e?.chef && !(meta.series || []).some((s) => s.id === e.chef.serie)) err(nom, `le chef renvoie à une série inconnue : ${e.chef.serie}`);
      }
    }
    // Pack signé : la signature doit correspondre au contenu actuel (sinon il faut re-signer avec l'atelier).
    if (meta.signature) {
      const ordre = Object.keys(cartes).sort();
      const r = verifierPack({ ...meta, cartes: ordre.map((id) => cartes[id]) }, { racines: cles.racines, revoquees: cles.revocations ?? [], date: new Date().toISOString().slice(0, 10) });
      if (r.confiance === "invalide") err(pack, `signature invalide : ${r.raison} Re-signe le pack avec « npm run atelier -- signer-pack ».`);
      else console.log(`Pack ${pack} : signature ${r.confiance === "officiel" ? "officielle" : "locale"} valide.`);
    }
    console.log(`Pack ${pack} : ${Object.keys(cartes).length} cartes vérifiées.`);
  }
}
// Règles réglables (data/regles.json)
{
  const r = JSON.parse(readFileSync(join(racine, "data/regles.json"), "utf8"));
  if (!Number.isInteger(r.cartesMaxParJour) || r.cartesMaxParJour < 3 || r.cartesMaxParJour % 3 !== 0) err("data/regles.json", "cartesMaxParJour doit être un multiple de 3 (3 cartes par booster), au moins 3");
}

// Actions militantes (data/actions.json)
{
  const c = JSON.parse(readFileSync(join(racine, "data/actions.json"), "utf8"));
  const nom = "data/actions.json";
  const categories = new Set((c.categories ?? []).map((x) => x.id));
  const recompenseValide = (r) => r && typeof r === "object" && ["fragments", "boosters"].some((k) => Number.isInteger(r[k]) && r[k] > 0) && Object.values(r).every((v) => Number.isInteger(v) && v >= 0 && v <= 5);
  if (!Array.isArray(c.objectifs?.choix) || !c.objectifs.choix.includes(c.objectifs.defaut)) err(nom, "objectifs.choix doit contenir objectifs.defaut");
  if (!recompenseValide(c.objectifs?.recompense)) err(nom, "objectifs.recompense : des fragments ou des boosters (entiers de 1 à 5)");
  const ids = new Set();
  for (const a of c.actions ?? []) {
    const ici = `${nom} ${a?.id ?? "?"}`;
    if (!/^[a-z0-9-]+$/.test(a?.id ?? "")) err(ici, "identifiant invalide (minuscules, chiffres, tirets)");
    if (ids.has(a.id)) err(ici, "identifiant en double");
    ids.add(a.id);
    if (!categories.has(a.categorie)) err(ici, `catégorie inconnue « ${a.categorie} »`);
    for (const champ of ["nom", "description"]) if (typeof a[champ] !== "string" || !a[champ].trim()) err(ici, `champ « ${champ} » manquant`);
    if (!recompenseValide(a.recompense)) err(ici, "recompense : des fragments ou des boosters (entiers de 1 à 5)");
    if (!Number.isInteger(a.plafond?.nombre) || a.plafond.nombre < 1 || !["jour", "semaine", "toujours"].includes(a.plafond?.par)) err(ici, "plafond : { nombre: 1 ou plus, par: jour | semaine | toujours }");
  }
}

// Dessins déposés dans data/dessins/ (noms, formats, tailles, sécurité)
{
  const { lireDessins } = await import("./dessins.mjs");
  const { dessins, problemes } = lireDessins(racine);
  for (const p of problemes) err("data/dessins", p);
  const n = Object.keys(dessins).length;
  if (n) console.log(`Dessins déposés : ${n} (ils remplacent les dessins en code).`);
}

// Fiches des collectifs : la délégation doit être signée par le collectif racine et correspondre à la fiche.
const dossierCollectifs = join(racine, "data/collectifs");
if (existsSync(dossierCollectifs)) for (const f of readdirSync(dossierCollectifs).filter((x) => x.endsWith(".json"))) {
  const c = JSON.parse(readFileSync(join(dossierCollectifs, f), "utf8"));
  const nom = `collectif ${f}`;
  if (`${c.id}.json` !== f) err(nom, `l'id "${c.id}" ne correspond pas au nom du fichier`);
  if (!c.delegation) { err(nom, "pas de délégation"); continue; }
  if (c.delegation.clePublique !== c.clePublique || c.delegation.collectif !== c.id) err(nom, "la délégation ne correspond pas à la fiche");
  const v = verifierDelegation(c.delegation, { racines: cles.racines, revoquees: cles.revocations ?? [], date: new Date().toISOString().slice(0, 10) });
  if (!v.ok) console.log(`⚠ ${nom} : ${v.raison}`);
}

console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nAucune erreur.");
process.exit(erreurs ? 1 : 0);
