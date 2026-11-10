// Formats des QR codes : « MDL1:<type>:<contenu>[.<signature>] », contenu en base64url.
//   S  code de stand (booster spécial), signé par la racine ou un collectif local
//   E  carte d'événement numérotée, signée par la racine
//   C  carte officielle donnée par un·e camarade (non signée : jeu de confiance)
//   P  carte perso partagée (non signée)
import type { Carte, Rarete } from "./formats";
import { verifier, verifierDelegation, type Confiance, type DelegationSignee, type Hex, signer } from "./signature";

export const PREFIXE_QR = "MDL1";

export interface QrStand { t: "S"; /** identifiant unique du QR */ i: string; m: Rarete; du: string; au: string; /** collectif local émetteur, absent si racine */ c?: string }
/** La carte elle-même peut voyager dans le QR : on l'obtient même sans avoir mis ses packs à jour. */
export interface CarteDansQr { title: string; dates?: string; orgas?: string; fait?: string; phrase?: string; pourquoi?: string; tirage: number }
export interface QrEvenement { t: "E"; e: string; n: number; du: string; au: string; k?: CarteDansQr }
export interface QrDon { t: "C"; i: string; /** identifiant du don, pour qu'il ne soit reçu qu'une fois */ x: string }
export interface QrPerso { t: "P"; x: string; carte: Omit<Carte, "id"> }
export type ContenuQr = QrStand | QrEvenement | QrDon | QrPerso;

/* ---------- base64url (texte UTF-8 ⇄ ASCII) ---------- */

function versBase64url(texte: string): string {
  const octets = new TextEncoder().encode(texte);
  let binaire = "";
  octets.forEach((o) => (binaire += String.fromCharCode(o)));
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function depuisBase64url(b64: string): string {
  const binaire = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binaire, (c) => c.charCodeAt(0)));
}

const hexVersB64 = (hex: string) => btoa(String.fromCharCode(...hex.match(/../g)!.map((h) => parseInt(h, 16)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64VersHex = (b64: string) => Array.from(atob(b64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");

/* ---------- Écrire et lire ---------- */

export function encoderQr(contenu: ContenuQr, secrete?: Hex): string {
  const corps = `${PREFIXE_QR}:${contenu.t}:${versBase64url(JSON.stringify(contenu))}`;
  return secrete ? `${corps}.${hexVersB64(signer(contenu, secrete))}` : corps;
}

export interface QrLu {
  contenu: ContenuQr;
  signature: Hex | null;
}

/** Lit un QR. Renvoie null si ce n'est pas un QR de l'app ou s'il est abîmé. */
export function lireQr(texte: string): QrLu | null {
  const m = texte.trim().match(/^MDL1:([SECP]):([A-Za-z0-9_-]+)(?:\.([A-Za-z0-9_-]+))?$/);
  if (!m) return null;
  try {
    const contenu = JSON.parse(depuisBase64url(m[2])) as ContenuQr;
    if (!contenu || contenu.t !== m[1]) return null;
    return { contenu, signature: m[3] ? b64VersHex(m[3]) : null };
  } catch {
    return null;
  }
}

/* ---------- Vérifier un QR signé ---------- */

export type VerdictQr = { ok: true; emetteur: string } | { ok: false; raison: string };

/**
 * Vérifie un QR de stand ou d'événement : signature, émetteur autorisé, dates de validité.
 * @param delegations délégations des collectifs locaux auxquels l'utilisateur fait confiance
 * @param nomRacine nom affiché du collectif racine
 */
export function verifierQr(lu: QrLu, c: Confiance, delegations: DelegationSignee[], nomRacine = "le collectif"): VerdictQr {
  const q = lu.contenu;
  if (q.t !== "S" && q.t !== "E") return { ok: true, emetteur: "un·e camarade" };
  if (!lu.signature) return { ok: false, raison: "Ce QR n'est pas signé." };
  if (c.date < q.du) return { ok: false, raison: `Ce QR n'est valable qu'à partir du ${q.du}.` };
  if (c.date > q.au) return { ok: false, raison: `Ce QR n'est plus valable depuis le ${q.au}.` };

  // Signé par une clé racine ?
  if (c.racines.some((cle) => verifier(q, lu.signature!, cle))) return { ok: true, emetteur: nomRacine };
  if (q.t === "E") return { ok: false, raison: "La signature de cette carte d'événement est fausse : ce QR n'est pas valide." };
  if (!q.c) return { ok: false, raison: "La signature de ce QR est fausse : il a peut-être été modifié." };

  // Sinon, signé par un collectif local de confiance, autorisé pour cette rareté ?
  const d = delegations.find((x) => x.collectif === q.c);
  if (!d) return { ok: false, raison: "Ce QR vient d'un collectif que ton app ne connaît pas encore. Installe son pack d'abord." };
  const v = verifierDelegation(d, c);
  if (!v.ok) return v;
  if (!verifier(q, lu.signature, d.clePublique)) return { ok: false, raison: "La signature de ce QR est fausse." };
  if (!d.droits.includes(q.m)) return { ok: false, raison: `Le collectif « ${d.nom} » n'a pas le droit de donner des cartes « ${q.m} ».` };
  return { ok: true, emetteur: d.nom };
}

/** Clé unique d'un QR, pour qu'il ne serve qu'une fois par téléphone. */
export function cleUnique(q: ContenuQr): string {
  switch (q.t) {
    case "S": return `S:${q.c ?? "racine"}:${q.i}`;
    case "E": return `E:${q.e}`; // une seule carte par événement et par téléphone
    case "C": return `C:${q.x}`;
    case "P": return `P:${q.x}`;
  }
}

/** Taille maximale d'un QR qui reste facile à scanner sur un téléphone. */
export const TAILLE_MAX_QR = 1800;
