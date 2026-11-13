declare module 'virtual:mdl-dessins' {
  /** Les dessins déposés dans data/dessins/, par nom (sans extension). */
  const dessins: Record<string, { type: 'svg' | 'png'; contenu: string }>
  export default dessins
}

declare module 'virtual:mdl-demo' {
  /** Clé de démonstration : seulement en développement, page de démo et tests. null dans l'app publiée. */
  const cle: { publique: string; secrete: string } | null
  export default cle
}

declare module 'virtual:mdl-donnees' {
  import type { Donnees } from '@mdl/noyau'
  const donnees: Donnees
  export default donnees
}
