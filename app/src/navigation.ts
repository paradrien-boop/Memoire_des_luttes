export type Ecran = 'manif' | 'album' | 'editeur' | 'plus'

const ecrans: Ecran[] = ['manif', 'album', 'editeur', 'plus']

/** L'écran affiché dépend de l'adresse (#album, #editeur…). */
export function ecranDepuisAdresse(hash: string): Ecran {
  const e = hash.replace('#', '') as Ecran
  return ecrans.includes(e) ? e : 'manif'
}
