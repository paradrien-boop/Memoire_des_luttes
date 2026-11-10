// Signatures Ed25519 : clés, packs signés, délégations aux collectifs locaux, révocations.
// Tout se vérifie hors ligne. Une signature porte sur la forme canonique (RFC 8785) des données,
// donc ni l'ordre des champs ni les espaces ne comptent, mais une seule lettre changée la casse.
import { ed25519 } from "@noble/curves/ed25519.js";
import { bytesToHex, hexToBytes } from "@noble/curves/utils.js";
import canonicalize from "canonicalize";
import type { Carte, Rarete } from "./formats";

export type Hex = string;

export interface Cles {
  secrete: Hex;
  publique: Hex;
}

export function genererCles(): Cles {
  const { secretKey, publicKey } = ed25519.keygen();
  return { secrete: bytesToHex(secretKey), publique: bytesToHex(publicKey) };
}

export function clePublique(secrete: Hex): Hex {
  return bytesToHex(ed25519.getPublicKey(hexToBytes(secrete)));
}

/** Empreinte lisible d'une clé publique, à comparer à l'œil (« 3f2a 91c0 77de 0b14 »). */
export function empreinte(publique: Hex): string {
  return publique.slice(0, 16).match(/.{4}/g)!.join(" ");
}

export function canon(donnees: unknown): Uint8Array {
  const texte = canonicalize(donnees);
  if (texte === undefined) throw new Error("Données impossibles à signer.");
  return new TextEncoder().encode(texte);
}

export function signer(donnees: unknown, secrete: Hex): Hex {
  return bytesToHex(ed25519.sign(canon(donnees), hexToBytes(secrete)));
}

export function verifier(donnees: unknown, signature: Hex, publique: Hex): boolean {
  try {
    return ed25519.verify(hexToBytes(signature), canon(donnees), hexToBytes(publique));
  } catch {
    return false;
  }
}

/* ---------- Délégations ---------- */

/** Autorisation donnée par le collectif racine à un collectif local. */
export interface Delegation {
  type: "delegation";
  /** Identifiant court du collectif local, par exemple « cgt-douarnenez ». */
  collectif: string;
  nom: string;
  clePublique: Hex;
  /** Raretés que le collectif peut signer. */
  droits: Rarete[];
  /** Dates au format AAAA-MM-JJ. */
  emise: string;
  expire: string;
}

export interface DelegationSignee extends Delegation {
  /** Clé de la racine qui a signé. */
  par: Hex;
  signature: Hex;
}

export function deleguer(d: Delegation, secreteRacine: Hex): DelegationSignee {
  return { ...d, par: clePublique(secreteRacine), signature: signer(d, secreteRacine) };
}

export interface Confiance {
  /** Clés publiques du collectif racine (intégrées à l'app). */
  racines: Hex[];
  /** Clés révoquées (publiées dans les packs officiels). */
  revoquees: Hex[];
  /** Date du jour, AAAA-MM-JJ. */
  date: string;
}

export type Verdict = { ok: true } | { ok: false; raison: string };

export function verifierDelegation(d: DelegationSignee, c: Confiance): Verdict {
  const { signature, par, ...contenu } = d;
  if (!c.racines.includes(par)) return { ok: false, raison: "La délégation n'est pas signée par le collectif racine." };
  if (!verifier(contenu, signature, par)) return { ok: false, raison: "La délégation a été modifiée ou sa signature est fausse." };
  if (c.revoquees.includes(d.clePublique)) return { ok: false, raison: `La clé du collectif « ${d.nom} » a été révoquée.` };
  if (d.expire < c.date) return { ok: false, raison: `La délégation du collectif « ${d.nom} » a expiré le ${d.expire}.` };
  return { ok: true };
}

/* ---------- Packs signés ---------- */

export interface SignaturePack {
  cle: Hex;
  valeur: Hex;
  /** Présente si le pack est signé par un collectif local. */
  delegation?: DelegationSignee;
}

export interface PackSignable {
  id: string;
  nom: string;
  cartes: Carte[];
  /** Clés révoquées : seulement prises en compte dans un pack officiel. */
  revocations?: Hex[];
  signature?: SignaturePack | null;
  [champ: string]: unknown;
}

/** Ce qui est signé : tout le pack, sauf la signature elle-même et son « type » (déduit, pas écrit dans le pack). */
function contenuSigne(pack: PackSignable): unknown {
  const { signature: _s, type: _t, ...reste } = pack;
  return reste;
}

export function signerPack<T extends PackSignable>(pack: T, secrete: Hex, delegation?: DelegationSignee): T {
  const cle = clePublique(secrete);
  if (delegation && delegation.clePublique !== cle) throw new Error("La clé ne correspond pas à la délégation.");
  const signature: SignaturePack = { cle, valeur: signer(contenuSigne(pack), secrete), ...(delegation ? { delegation } : {}) };
  return { ...pack, signature };
}

export type ResultatPack =
  | { confiance: "officiel" }
  | { confiance: "local"; collectif: { id: string; nom: string }; delegation: DelegationSignee }
  | { confiance: "non-signe" }
  | { confiance: "invalide"; raison: string };

export function verifierPack(pack: PackSignable, c: Confiance): ResultatPack {
  const s = pack.signature;
  if (!s) return { confiance: "non-signe" };
  if (c.revoquees.includes(s.cle)) return { confiance: "invalide", raison: "La clé qui a signé ce pack a été révoquée." };
  if (!verifier(contenuSigne(pack), s.valeur, s.cle)) return { confiance: "invalide", raison: "Ce pack a été modifié après sa signature, ou sa signature est fausse." };
  if (c.racines.includes(s.cle)) return { confiance: "officiel" };
  if (!s.delegation) return { confiance: "invalide", raison: "Ce pack est signé par une clé inconnue." };
  if (s.delegation.clePublique !== s.cle) return { confiance: "invalide", raison: "La délégation ne correspond pas à la clé qui a signé." };
  const d = verifierDelegation(s.delegation, c);
  if (!d.ok) return { confiance: "invalide", raison: d.raison };
  if (Array.isArray(pack.evenements) && pack.evenements.length) return { confiance: "invalide", raison: "Seul le collectif peut créer des cartes d'événement." };
  const interdite = pack.cartes.find((x) => !s.delegation!.droits.includes(x.rar as Rarete));
  if (interdite) return { confiance: "invalide", raison: `Le collectif « ${s.delegation.nom} » n'a pas le droit de créer des cartes « ${interdite.rar} ».` };
  return { confiance: "local", collectif: { id: s.delegation.collectif, nom: s.delegation.nom }, delegation: s.delegation };
}
