// Les dessins déposés dans data/dessins/ (voir data/dessins/README.md).
// Chaque dessin de l'app utilise le fichier s'il existe, et son dessin écrit en code sinon.
import fichiersDuDepot from 'virtual:mdl-dessins'

export type FichierDessin = { type: 'svg' | 'png'; contenu: string }

/**
 * L'atelier de dessin (atelier.html) peut essayer des fichiers sans les mettre dans le dépôt :
 * ils passent avant ceux du dépôt. « ignorer » montre les dessins sans eux, pour comparer.
 */
export const essais = $state<{ fichiers: Record<string, FichierDessin>; ignorer: boolean }>({ fichiers: {}, ignorer: false })

function trouver(nom: string): FichierDessin | undefined {
  if (essais.ignorer) return undefined
  return essais.fichiers[nom] ?? fichiersDuDepot[nom]
}

/** Couleur repère de la peau dans les dessins du personnage : remplacée par le teint choisi. */
export const PEAU_REPERE = '#ff00ff'

/** Le cadre de chaque type de dessin (point 0,0 au sol), identique à celui des gabarits. */
export const CADRES = {
  personnage: { x: -60, y: -170, l: 120, h: 180 },
  ennemis: { x: -60, y: -170, l: 120, h: 180 },
  chat: { x: -70, y: -130, l: 140, h: 140 },
  quartier: { x: 0, y: 0, l: 400, h: 300 },
} as const

/**
 * L'adresse (data:) d'un dessin déposé, ou null s'il n'existe pas.
 * @param peau pour le personnage : la couleur qui remplace la couleur repère de la peau
 */
export function dessin(nom: string, peau?: string): string | null {
  const f = trouver(nom)
  if (!f) return null
  if (f.type === 'png') return 'data:image/png;base64,' + f.contenu
  const texte = peau ? f.contenu.replace(/#ff00ff\b/gi, peau) : f.contenu
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(texte)
}

/** Le premier dessin qui existe parmi plusieurs noms (par exemple la variante d'une pose, puis le dessin de base). */
export function premier(noms: string[], peau?: string): string | null {
  for (const n of noms) {
    const d = dessin(n, peau)
    if (d) return d
  }
  return null
}

/** Combien de dessins ont été déposés (pour la planche). */
export const NOMBRE_DE_DESSINS = Object.keys(fichiersDuDepot).length
