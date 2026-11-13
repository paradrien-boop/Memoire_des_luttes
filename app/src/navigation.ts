export type Ecran = 'manif' | 'album' | 'quartier' | 'editeur' | 'plus' | 'dessins' | 'dessins-export'

const ecrans: Ecran[] = ['manif', 'album', 'quartier', 'editeur', 'plus', ...(import.meta.env.DEV ? (['dessins', 'dessins-export'] as Ecran[]) : [])]

/** L'écran affiché dépend de l'adresse (#album, #editeur…). */
export function ecranDepuisAdresse(hash: string): Ecran {
  const e = hash.replace('#', '') as Ecran
  return ecrans.includes(e) ? e : 'manif'
}
