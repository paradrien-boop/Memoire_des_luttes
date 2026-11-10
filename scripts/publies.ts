// Ce qui est publié à côté de l'app : les packs (sous la forme exacte qui est signée),
// leur index, les collectifs reconnus et les clés. Utilisé par le site et par scripts/publier.ts.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assembler } from "./assembler.mjs";
import { empreinte, verifierDelegation, verifierPack, type DelegationSignee, type PackSignable } from "../paquets/noyau/src/index";

export interface PackPublie {
  id: string;
  nom: string;
  fichier: string;
  cartes: number;
  confiance: "officiel" | "local" | "non-signe" | "invalide";
  signataire: string | null;
  /** Le pack tel qu'il est diffusé : pack.json + cartes, sans « type ». */
  contenu: PackSignable;
}

export interface CollectifPublie {
  id: string;
  nom: string;
  presentation: string;
  themes: string[];
  valide: boolean;
  raison?: string;
  expire?: string;
  empreinte?: string;
}

const aujourdhui = () => new Date().toISOString().slice(0, 10);

export function lireCles(racine: string): { nom: string; racines: string[]; revocations: string[] } {
  const c = JSON.parse(readFileSync(join(racine, "data/cles/racine.json"), "utf8"));
  return { nom: c.nom, racines: c.racines, revocations: c.revocations ?? [] };
}

export function packsPublies(racine: string): PackPublie[] {
  const cles = lireCles(racine);
  return assembler(racine).packs.map((p) => {
    const { type: _t, ...contenu } = p as typeof p & { signature?: unknown };
    const pack = contenu as unknown as PackSignable;
    const v = verifierPack(pack, { racines: cles.racines, revoquees: cles.revocations, date: aujourdhui() });
    return {
      id: p.id, nom: p.nom, fichier: `packs/${p.id}.json`, cartes: p.cartes.length, confiance: v.confiance,
      signataire: pack.signature ? empreinte((pack.signature as { cle: string }).cle) : null, contenu: pack,
    };
  });
}

/** Les collectifs de data/collectifs, avec l'état de leur délégation. Seuls ceux qui le souhaitent sont dans l'annuaire. */
export function collectifsPublies(racine: string): CollectifPublie[] {
  const dossier = join(racine, "data/collectifs");
  if (!existsSync(dossier)) return [];
  const cles = lireCles(racine);
  return readdirSync(dossier).filter((f) => f.endsWith(".json")).sort().map((f) => {
    const c = JSON.parse(readFileSync(join(dossier, f), "utf8"));
    const d = c.delegation as DelegationSignee | undefined;
    const v = d ? verifierDelegation(d, { racines: cles.racines, revoquees: cles.revocations, date: aujourdhui() }) : { ok: false as const, raison: "Pas encore de délégation." };
    return {
      id: c.id, nom: c.nom, presentation: c.presentation ?? "", themes: c.themes ?? [], annuaire: c.annuaire !== false,
      valide: v.ok, ...(v.ok ? {} : { raison: v.raison }), ...(d ? { expire: d.expire, empreinte: empreinte(d.clePublique) } : {}),
    };
  }).filter((c) => c.annuaire).map(({ annuaire: _a, ...c }) => c);
}
