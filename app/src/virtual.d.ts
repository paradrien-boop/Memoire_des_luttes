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
