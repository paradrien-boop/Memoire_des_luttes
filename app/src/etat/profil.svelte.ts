// Le profil : le personnage (créé une fois, puis enregistré tel quel) et l'engagement
// (les actions militantes que la personne se sent de mener, et son objectif de la semaine).
// Pour la vie privée, aucun historique des actions n'est gardé : seulement les compteurs de la période en cours.
import { compterManif, COMPTEURS_VIDES, declarer, restantes, semaineDe, type Compteurs, type Recompense } from '@mdl/noyau'
import { base } from '../stockage/base'
import { ACTIONS } from '../donnees'
import { dateDuJour } from '../outils'
import { jeu } from './jeu.svelte'
import { quartier } from './quartier.svelte'

export interface Personnage { nom: string; teint: number; coiffure: number }

export interface ResultatEngagement {
  recompense: Required<Recompense>
  objectifAtteint: boolean
  /** Boosters complétés au total (boosters directs, et fragments qui ont fait un booster). */
  boostersGagnes: number
}

class Profil {
  pret = $state(false)
  /** Le personnage enregistré (null tant qu'il n'a pas été créé). */
  personnage = $state<Personnage | null>(null)
  actionsChoisies = $state<string[]>([])
  objectif = $state(ACTIONS.objectifs.defaut)
  compteurs = $state<Compteurs>(COMPTEURS_VIDES)

  async charger() {
    const r = Object.fromEntries((await base.reglages.toArray()).map((x) => [x.cle, x.valeur]))
    this.personnage = (r.personnage as Personnage) ?? null
    const e = r.engagement as { actions: string[]; objectif: number } | undefined
    // On ne garde que les actions qui existent encore dans la configuration.
    this.actionsChoisies = (e?.actions ?? []).filter((id) => ACTIONS.actions.some((a) => a.id === id))
    this.objectif = e?.objectif ?? ACTIONS.objectifs.defaut
    this.compteurs = (r.compteursActions as Compteurs) ?? COMPTEURS_VIDES
    this.pret = true
  }

  private regler(valeurs: Record<string, unknown>) {
    return base.reglages.bulkPut(Object.entries(valeurs).map(([cle, valeur]) => ({ cle, valeur: $state.snapshot(valeur) })))
  }

  /** Enregistre le personnage, une fois pour toutes (on peut le modifier ensuite, depuis le profil). */
  async enregistrerPersonnage(p: Personnage) {
    this.personnage = { nom: p.nom.trim().slice(0, 30), teint: p.teint, coiffure: p.coiffure }
    await this.regler({ personnage: this.personnage })
    await quartier.changerApparence({ teint: p.teint, coiffure: p.coiffure })
  }

  async enregistrerEngagement(actions: string[], objectif: number) {
    this.actionsChoisies = actions
    this.objectif = objectif
    await this.regler({ engagement: { actions, objectif } })
  }

  restantes(id: string): number {
    const a = ACTIONS.actions.find((x) => x.id === id)
    return a ? restantes(a, this.compteurs, dateDuJour()) : 0
  }

  /** Actions faites cette semaine (pour l'objectif), remis à zéro chaque lundi. */
  get faitesCetteSemaine(): number {
    return this.compteurs.semaine === this.semaineEnCours() ? this.compteurs.totalSemaine : 0
  }

  private semaineEnCours() {
    return semaineDe(dateDuJour())
  }

  private async recompenser(r: Required<Recompense>): Promise<number> {
    let boosters = r.boosters
    if (r.boosters) await jeu.ajouterBoosters(r.boosters)
    if (r.fragments) boosters += await quartier.ajouterFragments(r.fragments)
    return boosters
  }

  /** Déclare une action faite. @returns null si elle a déjà été déclarée autant que permis */
  async faire(id: string): Promise<ResultatEngagement | null> {
    const a = ACTIONS.actions.find((x) => x.id === id)
    if (!a) return null
    const r = declarer(a, $state.snapshot(this.compteurs) as Compteurs, dateDuJour(), this.objectif, ACTIONS)
    if (!r) return null
    this.compteurs = r.compteurs
    await this.regler({ compteursActions: r.compteurs })
    return { recompense: r.recompense, objectifAtteint: r.objectifAtteint, boostersGagnes: await this.recompenser(r.recompense) }
  }

  /** Un jour de manif validé compte pour l'objectif de la semaine. */
  async manifValidee(): Promise<ResultatEngagement> {
    const r = compterManif($state.snapshot(this.compteurs) as Compteurs, dateDuJour(), this.objectif, ACTIONS)
    this.compteurs = r.compteurs
    await this.regler({ compteursActions: r.compteurs })
    return { recompense: r.recompense, objectifAtteint: r.objectifAtteint, boostersGagnes: await this.recompenser(r.recompense) }
  }
}

export const profil = new Profil()
