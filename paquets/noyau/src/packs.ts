// Export et import de packs de cartes perso (non signés).
import type { Carte, Famille, Rarete } from "./formats";

export const FORMAT_PACK = "memoire-des-luttes/pack";
const RARETES: Rarete[] = ["base", "rare", "legendaire"];
const CHAMPS_FIXES = new Set(["id", "fam", "rar", "links", "img", "serie", "statut"]);

export interface PackLu {
  nom: string;
  cartes: Carte[];
}

/** Produit le texte d'un pack à partager. Les identifiants ne sont pas exportés. */
export function exporterPack(nom: string, cartes: Carte[]): string {
  const pack = {
    format: FORMAT_PACK,
    version: 1,
    nom: nom.trim() || "Pack sans nom",
    signature: null,
    cartes: cartes.map(({ id: _id, ...c }) => c),
  };
  return JSON.stringify(pack, null, 1);
}

/**
 * Lit un pack reçu. Tout ce qui vient de l'extérieur est nettoyé :
 * seules les rubriques en texte sont gardées, les familles réservées sont refusées,
 * les images doivent être des images intégrées.
 * @throws Error avec un message à montrer à l'utilisateur
 */
export function lirePack(texte: string, familles: Record<string, Famille>, prefixeId: string): PackLu {
  let brut: unknown;
  try { brut = JSON.parse(texte); } catch { throw new Error("Ce texte n'est pas un pack valide."); }
  const p = brut as { nom?: unknown; cartes?: unknown };
  if (!p || typeof p !== "object" || !Array.isArray(p.cartes)) throw new Error("Ce texte n'est pas un pack valide.");

  const cartes: Carte[] = [];
  p.cartes.forEach((c: unknown, i: number) => {
    if (!c || typeof c !== "object") return;
    const s = c as Record<string, unknown>;
    if (typeof s.title !== "string" || !s.title.trim()) return;
    const fam = typeof s.fam === "string" && familles[s.fam] && !familles[s.fam].reserveeAuCollectif ? s.fam : "evenement";
    const rar = RARETES.includes(s.rar as Rarete) ? (s.rar as Rarete) : "base";
    const carte: Carte = { id: `${prefixeId}-${i}`, fam, rar, title: s.title.slice(0, 120), links: [] };
    for (const [k, v] of Object.entries(s)) {
      if (CHAMPS_FIXES.has(k) || k === "title") continue;
      if (typeof v === "string") carte[k] = v.slice(0, 1000);
    }
    if (typeof s.img === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(s.img)) carte.img = s.img;
    cartes.push(carte);
  });
  if (!cartes.length) throw new Error("Ce pack ne contient aucune carte lisible.");
  const nom = typeof p.nom === "string" && p.nom.trim() ? p.nom.trim().slice(0, 60) : "Pack importé";
  return { nom, cartes };
}
