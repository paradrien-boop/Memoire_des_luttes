// Le catalogue des cartes : celles intégrées à l'app (data/, au moment du build)
// et celles des packs installés ensuite (officiels vérifiés, locaux acceptés).
import brut from 'virtual:mdl-donnees'
import demo from 'virtual:mdl-demo'
import { preparerCatalogue, type Pack } from '@mdl/noyau'

export const catalogue = $state(preparerCatalogue(brut))

/** Remet à jour le catalogue avec les packs installés. */
export function installerDansCatalogue(packs: Pack[]) {
  Object.assign(catalogue, preparerCatalogue(brut, packs))
}

/** Nom du collectif racine, affiché comme émetteur. */
export const NOM_COLLECTIF = brut.cles?.nom ?? 'Mémoire des luttes'

/**
 * Clés publiques du collectif auxquelles l'app fait confiance.
 * La clé de démonstration s'y ajoute seulement en développement, dans la page de démo et les tests.
 */
export const RACINES: string[] = [...(brut.cles?.racines ?? []), ...(demo ? [demo.publique] : [])]

/** Les révocations publiées dans les packs officiels intégrés à l'app. */
export const REVOCATIONS_INTEGREES: string[] = [...(brut.cles?.revocations ?? []), ...brut.packs.flatMap((p) => p.revocations ?? [])]

export { demo as CLE_DEMO }

/** Les actions militantes proposées et leurs récompenses (data/actions.json). */
export const ACTIONS = brut.actions!
