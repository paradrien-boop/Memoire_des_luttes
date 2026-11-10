// Prépare un BROUILLON de carte à partir de Wikipédia et Wikidata.
// À lancer sur un ordinateur connecté. La carte créée a le statut « proposee » : il reste à réécrire
// le texte, écrire « Pourquoi ça compte encore », vérifier chaque fait et chaque source.
//
// npm run brouillon -- --titre "Louise Michel" --famille personnalite --pack commune-1871 --serie comm [--id louise-michel] [--type officiel|local]
import { parseArgs } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { brouillon, entites, PROPRIETES_A_LIBELLER, type EntiteWikidata, type ResumeWikipedia } from "./wikidata";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
// Un nom générique, sans aucune information personnelle.
const ENTETES = { "User-Agent": "MemoireDesLuttes-brouillons/1.0", Accept: "application/json" };

async function json<T>(url: string): Promise<T> {
  let r: Response;
  try { r = await fetch(url, { headers: ENTETES }); }
  catch { throw new Error(`Impossible de joindre ${new URL(url).host} : il faut une connexion à Internet pour préparer un brouillon.`); }
  if (!r.ok) throw new Error(`${url} : ${r.status} ${r.statusText}`);
  return (await r.json()) as T;
}

const identifiant = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

async function principal() {
  const { values: o } = parseArgs({ options: {
    titre: { type: "string" }, famille: { type: "string" }, pack: { type: "string" }, serie: { type: "string" },
    id: { type: "string" }, type: { type: "string", default: "officiel" },
  } });
  for (const n of ["titre", "famille", "pack", "serie"] as const) if (!o[n]) throw new Error(`Il manque --${n}.`);
  const familles = JSON.parse(readFileSync(join(racine, "data/familles/familles.json"), "utf8"));
  if (!familles[o.famille!] || familles[o.famille!].reserveeAuCollectif) throw new Error(`Famille inconnue ou réservée : ${o.famille}. Familles : ${Object.keys(familles).filter((f) => !familles[f].reserveeAuCollectif).join(", ")}.`);
  const dossier = join(racine, "data/packs", o.type!, o.pack!);
  if (!existsSync(join(dossier, "pack.json"))) throw new Error(`Pack introuvable : ${dossier}`);
  const meta = JSON.parse(readFileSync(join(dossier, "pack.json"), "utf8"));
  const serie = meta.series?.find((s: { id: string }) => s.id === o.serie);
  if (!serie) throw new Error(`Série « ${o.serie} » introuvable dans ce pack. Séries : ${(meta.series ?? []).map((s: { id: string }) => s.id).join(", ")}.`);

  const resume = await json<ResumeWikipedia>(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(o.titre!.replace(/ /g, "_"))}`);
  let entite: EntiteWikidata | null = null;
  const libelles: Record<string, string> = {};
  if (resume.wikibase_item) {
    const d = await json<{ entities: Record<string, EntiteWikidata> }>(`https://www.wikidata.org/wiki/Special:EntityData/${resume.wikibase_item}.json`);
    entite = d.entities[resume.wikibase_item];
    const aLibeller = [...new Set((PROPRIETES_A_LIBELLER[o.famille!] ?? []).flatMap((p) => entites(entite!, p)))].slice(0, 20);
    if (aLibeller.length) {
      const l = await json<{ entities: Record<string, { labels?: { fr?: { value: string } } }> }>(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=fr&ids=${aLibeller.join("|")}`);
      for (const [q, v] of Object.entries(l.entities)) if (v.labels?.fr) libelles[q] = v.labels.fr.value;
    }
  }

  const id = o.id ?? identifiant(resume.title);
  const fichier = join(dossier, "cartes", `${id}.json`);
  if (existsSync(fichier)) throw new Error(`La carte ${fichier} existe déjà : je ne l'écrase pas.`);
  const carte = { ...brouillon(id, o.famille!, resume, entite, libelles), serie: o.serie };
  writeFileSync(fichier, JSON.stringify(carte, null, 2) + "\n");
  serie.cartes.push(id);
  writeFileSync(join(dossier, "pack.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log(`Brouillon écrit : ${fichier}\nAjouté à la série « ${serie.nom} ».\n\nÀ faire avant validation :\n- réécrire « fait » (le texte de Wikipédia ne peut pas être repris tel quel) ;\n- écrire « pourquoi » (le regard militant) ;\n- vérifier chaque fait et chaque source, ajouter des liens vers d'autres cartes ;\n- puis npm run valider.`);
  if (meta.signature) console.log("\n⚠ Ce pack était signé : il faudra le re-signer avec l'atelier.");
}

principal().catch((e) => { console.error("✗ " + (e as Error).message); process.exit(1); });
