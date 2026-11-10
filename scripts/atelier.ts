// L'atelier du collectif : à utiliser sur un ordinateur JAMAIS connecté à Internet.
// Usage : npm run atelier -- <commande> [options]   (npm run atelier -- aide)
import { parseArgs } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import { assembler } from "./assembler.mjs";
import {
  clePublique, deleguer, empreinte, encoderQr, genererCles, signerPack, verifierPack,
  type DelegationSignee, type PackSignable, type Rarete,
} from "../paquets/noyau/src/index";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const aujourdhui = new Date().toISOString().slice(0, 10);

const AIDE = `
L'atelier du collectif Mémoire des luttes. À utiliser sur un ordinateur jamais connecté à Internet.

  cles          --sortie F                      Crée une paire de clés. La clé secrète va dans F, à garder hors du dépôt.
  empreinte     --cle F | --publique HEX        Affiche l'empreinte d'une clé, à comparer à l'œil.
  deleguer      --cle F --collectif ID --nom NOM --publique HEX --droits base,rare --expire AAAA-MM-JJ --sortie F
                                                Délivre une délégation à un collectif local (signée par la clé racine F).
  signer-pack   --pack DOSSIER --cle F [--delegation F] [--sortie F] [--ecrire]
                                                Signe un pack de data/packs. --ecrire met la signature dans son pack.json,
                                                --sortie écrit le pack complet, prêt à diffuser.
  reconnaitre   --demande F --cle F --droits base,rare --expire AAAA-MM-JJ [--parrains a,b]
                                                Reconnaît un collectif à partir de la demande générée par le site (page Clés) :
                                                écrit data/collectifs/<id>.json avec sa délégation signée.
  revoquer      --publique HEX                  Révoque une clé : l'ajoute à data/cles/racine.json (puis à un pack officiel).
  verifier      --pack DOSSIER | --fichier F    Vérifie la signature d'un pack.
  qr-stand      --cle F [--delegation F] --nom NOM --minimum base|rare|legendaire --du J --au J [--nombre N] --sortie F.html
                                                Planche de QR de stand à imprimer (un booster spécial, une fois par téléphone).
  qr-evenement  --cle F --evenement ID --du J --au J [--de 1] [--a TIRAGE] --sortie F.html
                                                Planche de QR numérotés d'une carte d'événement (clé racine seulement).
`;

function lireCle(f: string): { secrete: string; publique: string } {
  const k = JSON.parse(readFileSync(f, "utf8"));
  if (!k.secrete) throw new Error(`${f} ne contient pas de clé secrète.`);
  return { secrete: k.secrete, publique: clePublique(k.secrete) };
}

function racines(): string[] {
  return JSON.parse(readFileSync(join(racine, "data/cles/racine.json"), "utf8")).racines;
}

function revocations(): string[] {
  return JSON.parse(readFileSync(join(racine, "data/cles/racine.json"), "utf8")).revocations ?? [];
}

/** Une délégation, lue dans un fichier de délégation ou dans une fiche de data/collectifs. */
function lireDelegation(f: string): DelegationSignee {
  const d = JSON.parse(readFileSync(f, "utf8"));
  return (d.delegation ?? d) as DelegationSignee;
}

/** Le pack tel qu'il est signé et diffusé : pack.json + ses cartes, sans « type » ni signature. */
function lirePack(dossier: string): { pack: PackSignable; fichierMeta: string } {
  const abs = resolve(dossier);
  const d = assembler(racine);
  const p = d.packs.find((x) => resolve(join(racine, "data/packs", x.type, x.id)) === abs || x.id === dossier);
  if (!p) throw new Error(`Pack introuvable : ${dossier}. Donne un dossier de data/packs/officiel ou data/packs/local.`);
  const { type, signature: _s, ...pack } = p as typeof p & { signature?: unknown };
  return { pack: pack as unknown as PackSignable, fichierMeta: join(racine, "data/packs", type, p.id, "pack.json") };
}

const echapper = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function planche(titre: string, sousTitre: string, qrs: { texte: string; legende: string }[]): Promise<string> {
  const cases = await Promise.all(qrs.map(async (q) =>
    `<figure>${await QRCode.toString(q.texte, { type: "svg", errorCorrectionLevel: "M", margin: 1 })}<figcaption>${echapper(q.legende)}</figcaption></figure>`));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echapper(titre)}</title>
<style>
  @page { size: A4; margin: 10mm; }
  body { font-family: "Arial Narrow", sans-serif; margin: 0; }
  header { border-bottom: 3px solid #000; margin-bottom: 6mm; }
  h1 { margin: 0; font-size: 18pt; text-transform: uppercase; } p { margin: 2mm 0; font-size: 10pt; }
  main { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
  figure { margin: 0; border: 1px dashed #999; padding: 2mm; text-align: center; break-inside: avoid; }
  figure svg { width: 100%; height: auto; display: block; }
  figcaption { font-size: 8pt; font-weight: bold; margin-top: 1mm; }
</style></head><body><header><h1>${echapper(titre)}</h1><p>${echapper(sousTitre)}</p></header><main>${cases.join("")}</main></body></html>`;
}

async function principal() {
  const [commande, ...reste] = process.argv.slice(2);
  const { values: o } = parseArgs({
    args: reste,
    options: {
      sortie: { type: "string" }, cle: { type: "string" }, publique: { type: "string" }, delegation: { type: "string" },
      collectif: { type: "string" }, nom: { type: "string" }, droits: { type: "string" }, expire: { type: "string" },
      pack: { type: "string" }, fichier: { type: "string" }, ecrire: { type: "boolean" },
      minimum: { type: "string" }, du: { type: "string" }, au: { type: "string" }, nombre: { type: "string" },
      evenement: { type: "string" }, de: { type: "string" }, a: { type: "string" },
      demande: { type: "string" }, parrains: { type: "string" },
    },
  });
  const exiger = (...noms: (keyof typeof o)[]) => { for (const n of noms) if (!o[n]) throw new Error(`Il manque --${n}.`); };

  switch (commande) {
    case "cles": {
      exiger("sortie");
      if (existsSync(o.sortie!)) throw new Error(`${o.sortie} existe déjà : je ne l'écrase pas.`);
      if (resolve(o.sortie!).startsWith(racine) && !o.sortie!.includes(".cle-secrete")) throw new Error("La clé secrète ne doit pas être écrite dans le dépôt (ou alors dans un fichier « .cle-secrete », ignoré par git).");
      const k = genererCles();
      writeFileSync(o.sortie!, JSON.stringify({ avertissement: "CLÉ SECRÈTE. Ne jamais la copier sur un ordinateur connecté ni dans le dépôt.", ...k }, null, 2) + "\n", { mode: 0o600 });
      console.log(`Clé secrète écrite dans ${o.sortie}\nClé publique : ${k.publique}\nEmpreinte    : ${empreinte(k.publique)}`);
      break;
    }
    case "empreinte": {
      const pub = o.publique ?? (o.cle ? lireCle(o.cle).publique : null);
      if (!pub) throw new Error("Donne --cle ou --publique.");
      console.log(empreinte(pub));
      break;
    }
    case "deleguer": {
      exiger("cle", "collectif", "nom", "publique", "droits", "expire", "sortie");
      const droits = o.droits!.split(",").map((x) => x.trim()) as Rarete[];
      if (droits.some((d) => !["base", "rare", "legendaire"].includes(d))) throw new Error("Droits possibles : base, rare, legendaire.");
      const d = deleguer({ type: "delegation", collectif: o.collectif!, nom: o.nom!, clePublique: o.publique!, droits, emise: aujourdhui, expire: o.expire! }, lireCle(o.cle!).secrete);
      writeFileSync(o.sortie!, JSON.stringify(d, null, 2) + "\n");
      console.log(`Délégation pour « ${o.nom} » écrite dans ${o.sortie} (valable jusqu'au ${o.expire}).`);
      break;
    }
    case "signer-pack": {
      exiger("pack", "cle");
      const { pack, fichierMeta } = lirePack(o.pack!);
      const delegation = o.delegation ? lireDelegation(o.delegation) : undefined;
      const signe = signerPack(pack, lireCle(o.cle!).secrete, delegation);
      if (o.ecrire) {
        const meta = JSON.parse(readFileSync(fichierMeta, "utf8"));
        writeFileSync(fichierMeta, JSON.stringify({ ...meta, signature: signe.signature }, null, 2) + "\n");
        console.log(`Signature écrite dans ${fichierMeta}.`);
      }
      if (o.sortie) { writeFileSync(o.sortie, JSON.stringify(signe) + "\n"); console.log(`Pack signé, prêt à diffuser : ${o.sortie}`); }
      if (!o.ecrire && !o.sortie) throw new Error("Donne --ecrire et/ou --sortie.");
      break;
    }
    case "reconnaitre": {
      exiger("demande", "cle", "droits", "expire");
      const dm = JSON.parse(readFileSync(o.demande!, "utf8"));
      if (dm.type !== "demande-de-reconnaissance") throw new Error("Ce fichier n'est pas une demande de reconnaissance (page Clés du site).");
      if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(dm.id ?? "")) throw new Error("Identifiant de collectif invalide.");
      if (!/^[0-9a-f]{64}$/.test(dm.clePublique ?? "")) throw new Error("Clé publique invalide.");
      if (dm.empreinte && dm.empreinte !== empreinte(dm.clePublique)) throw new Error("L'empreinte de la demande ne correspond pas à sa clé publique.");
      const droits = o.droits!.split(",").map((x) => x.trim()) as Rarete[];
      if (droits.some((d) => !["base", "rare", "legendaire"].includes(d))) throw new Error("Droits possibles : base, rare, legendaire.");
      const cible = join(racine, "data/collectifs", `${dm.id}.json`);
      const delegation = deleguer({ type: "delegation", collectif: dm.id, nom: dm.nom, clePublique: dm.clePublique, droits, emise: aujourdhui, expire: o.expire! }, lireCle(o.cle!).secrete);
      const fiche = {
        id: dm.id, nom: dm.nom, presentation: dm.presentation ?? "", themes: dm.themes ?? [], annuaire: dm.annuaire !== false,
        clePublique: dm.clePublique, parrains: o.parrains ? o.parrains.split(",").map((x) => x.trim()) : [], delegation,
      };
      writeFileSync(cible, JSON.stringify(fiche, null, 2) + "\n");
      console.log(`Collectif « ${dm.nom} » reconnu : ${cible}\nEmpreinte de sa clé : ${empreinte(dm.clePublique)} (à confirmer de vive voix avec le collectif).\nEnvoie-lui ce fichier : il en a besoin pour signer (--delegation).`);
      break;
    }
    case "revoquer": {
      exiger("publique");
      if (!/^[0-9a-f]{64}$/.test(o.publique!)) throw new Error("Clé publique invalide.");
      const f = join(racine, "data/cles/racine.json");
      const c = JSON.parse(readFileSync(f, "utf8"));
      c.revocations = [...new Set([...(c.revocations ?? []), o.publique])];
      writeFileSync(f, JSON.stringify(c, null, 2) + "\n");
      console.log(`Clé ${empreinte(o.publique!)} révoquée dans data/cles/racine.json : les nouvelles versions de l'app et le site la refusent.\nPour les apps déjà installées : ajoute-la aussi à « revocations » dans le pack.json d'un pack officiel, puis re-signe ce pack et publie-le.`);
      break;
    }
    case "verifier": {
      const pack = o.fichier ? (JSON.parse(readFileSync(o.fichier, "utf8")) as PackSignable) : (() => {
        exiger("pack");
        const { pack, fichierMeta } = lirePack(o.pack!);
        return { ...pack, signature: JSON.parse(readFileSync(fichierMeta, "utf8")).signature ?? null };
      })();
      const r = verifierPack(pack, { racines: racines(), revoquees: revocations(), date: aujourdhui });
      console.log(r.confiance === "invalide" ? `✗ Invalide : ${r.raison}` : r.confiance === "local" ? `✓ Pack local signé par « ${r.collectif.nom} »` : r.confiance === "officiel" ? "✓ Pack officiel, signature valide" : "Pack non signé");
      if (r.confiance === "invalide") process.exitCode = 1;
      break;
    }
    case "qr-stand": {
      exiger("cle", "nom", "minimum", "du", "au", "sortie");
      const k = lireCle(o.cle!);
      const delegation = o.delegation ? lireDelegation(o.delegation) : undefined;
      const nombre = Number(o.nombre ?? 20);
      const base = o.nom!.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
      const qrs = Array.from({ length: nombre }, (_, i) => {
        const id = `${base}-${aujourdhui}-${i + 1}`;
        return { texte: encoderQr({ t: "S", i: id, m: o.minimum as Rarete, du: o.du!, au: o.au!, ...(delegation ? { c: delegation.collectif } : {}) }, k.secrete), legende: `${o.nom} · ${i + 1}/${nombre}` };
      });
      writeFileSync(o.sortie!, await planche(o.nom!, `Booster spécial (carte ${o.minimum} garantie). Valable du ${o.du} au ${o.au}. Chaque QR ne sert qu'une fois par téléphone.`, qrs));
      console.log(`${nombre} QR de stand dans ${o.sortie}`);
      break;
    }
    case "qr-evenement": {
      exiger("cle", "evenement", "du", "au", "sortie");
      const ev = assembler(racine).evenements.find((e) => e.id === o.evenement);
      if (!ev) throw new Error(`Carte d'événement inconnue : ${o.evenement} (voir data/evenements).`);
      const k = lireCle(o.cle!);
      if (!racines().includes(k.publique)) console.warn("⚠ Cette clé n'est pas dans data/cles/racine.json : les apps refuseront ces QR.");
      const de = Number(o.de ?? 1), a = Number(o.a ?? ev.tirage);
      if (a > ev.tirage) throw new Error(`Le tirage de cette carte est de ${ev.tirage}.`);
      const qrs = Array.from({ length: a - de + 1 }, (_, i) => {
        const n = de + i;
        // La carte voyage dans le QR : on l'obtient même sans avoir mis ses packs à jour.
        const carte = { title: ev.title, dates: ev.dates as string, orgas: ev.orgas as string, fait: ev.fait as string, phrase: ev.phrase as string, pourquoi: ev.pourquoi as string, tirage: ev.tirage };
        return { texte: encoderQr({ t: "E", e: ev.id, n, du: o.du!, au: o.au!, k: carte }, k.secrete), legende: `${ev.title} · N° ${String(n).padStart(4, "0")} / ${ev.tirage}` };
      });
      writeFileSync(o.sortie!, await planche(`Carte d'événement : ${ev.title}`, `Valable du ${o.du} au ${o.au}. Une carte par personne : chaque téléphone n'en garde qu'une.`, qrs));
      console.log(`${qrs.length} QR numérotés (${de} à ${a}) dans ${o.sortie}`);
      break;
    }
    default:
      console.log(AIDE);
  }
}

principal().catch((e) => { console.error("✗ " + (e as Error).message); process.exit(1); });
