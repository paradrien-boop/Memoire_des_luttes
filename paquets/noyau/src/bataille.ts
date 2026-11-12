// Les batailles du quiz : chaque question oppose le personnage à un adversaire historique.
// Une bonne réponse, c'est une bataille gagnée. Fonctions pures.
import type { Carte } from "./formats";
import type { Hasard } from "./regles";

/** Un adversaire d'époque, défini dans un pack (ennemis.json). Jamais une personne vivante. */
export interface Ennemi {
  id: string;
  nom: string;
  epoque: string;
  description: string;
  /** Ce qu'il lance au début de la bataille. */
  replique: string;
  /** Ce qu'il crie en s'enfuyant. */
  defaite: string;
  /** Le dessin à utiliser (soldat, proprietaire, patron, censeur, mouchard, general…). */
  dessin: string;
  /** Familles de cartes sur lesquelles il attaque. */
  familles: string[];
  /** Un « chef » : il n'apparaît que si la série indiquée est complète, et rapporte double. */
  chef?: { serie: string };
}

/**
 * L'adversaire d'une question : parmi ceux qui attaquent sur la famille de la carte (sinon n'importe lequel).
 * Un chef remplace l'adversaire quand sa série est complète, pour la dernière question du jour.
 */
export function ennemiPour(carte: Carte, ennemis: Ennemi[], hasard: Hasard, seriesCompletes: string[] = [], derniere = false): Ennemi | null {
  const ordinaires = ennemis.filter((e) => !e.chef);
  if (derniere) {
    const chef = ennemis.find((e) => e.chef && seriesCompletes.includes(e.chef.serie) && (!carte.serie || e.chef.serie === carte.serie));
    if (chef) return chef;
  }
  const possibles = ordinaires.filter((e) => e.familles.includes(carte.fam));
  const liste = possibles.length ? possibles : ordinaires;
  return liste.length ? liste[Math.floor(hasard() * liste.length)] : null;
}

/** Points d'une bataille gagnée : la base, plus le bonus des objets, doublé contre un chef. */
export function pointsDeBataille(base: number, bonusObjets: number, chef: boolean): number {
  return (base + bonusObjets) * (chef ? 2 : 1);
}

/** Les réponses à montrer après avoir utilisé le porte-voix : on retire une mauvaise réponse au hasard. */
export function retirerUneMauvaise(choix: string[], bonne: number, dejaRetirees: number[], hasard: Hasard): number | null {
  const candidates = choix.map((_, i) => i).filter((i) => i !== bonne && !dejaRetirees.includes(i));
  if (candidates.length <= 1) return null; // on laisse toujours au moins une mauvaise réponse
  return candidates[Math.floor(hasard() * candidates.length)];
}
