import brut from 'virtual:mdl-donnees'
import { preparerCatalogue } from '@mdl/noyau'

/** Le catalogue des cartes, construit à partir de data/ au moment du build. */
export const catalogue = preparerCatalogue(brut)
