// La base de données du téléphone (IndexedDB, via Dexie). Rien n'en sort.
import Dexie, { type EntityTable } from 'dexie'
import type { Carte, CarteDansQr, DelegationSignee, PackSignable, Question, Souvenir } from '@mdl/noyau'

export interface Possession { id: string; n: number; premiere: number }
export interface PackImporte { cle?: number; nom: string; cartes: Carte[]; date: number }
/** « carte » : la carte reçue dans le QR, si l'app ne la connaissait pas encore. */
export interface EvenementObtenu { id: string; numero: number; date: string; carte?: CarteDansQr }
/** Un pack signé installé après coup. Un pack local n'est utilisé qu'une fois accepté. */
export interface PackInstalle {
  id: string
  pack: PackSignable
  confiance: 'officiel' | 'local'
  collectif?: { id: string; nom: string }
  delegation?: DelegationSignee
  accepte: boolean
  date: number
}
export interface CodeUtilise { code: string; date: number }
export interface Jour { date: string }
export interface Reglage { cle: string; valeur: unknown }
/** Le quiz d'un jour : ses questions sont fixées pour la journée. */
export interface QuizDuJour { date: string; questions: Question[]; reponses: (number | null)[] }

class Base extends Dexie {
  possessions!: EntityTable<Possession, 'id'>
  cartesPerso!: EntityTable<Carte, 'id'>
  packsImportes!: EntityTable<PackImporte, 'cle'>
  evenements!: EntityTable<EvenementObtenu, 'id'>
  codesUtilises!: EntityTable<CodeUtilise, 'code'>
  jours!: EntityTable<Jour, 'date'>
  reglages!: EntityTable<Reglage, 'cle'>
  quiz!: EntityTable<QuizDuJour, 'date'>
  memoire!: EntityTable<Souvenir, 'carteId'>
  packs!: EntityTable<PackInstalle, 'id'>

  constructor() {
    super('memoire-des-luttes')
    this.version(1).stores({
      possessions: 'id',
      cartesPerso: 'id',
      packsImportes: '++cle',
      evenements: 'id',
      codesUtilises: 'code',
      jours: 'date',
      reglages: 'cle',
    })
    // Version 2 : quiz du jour et mémoire par carte. Les données existantes sont gardées.
    this.version(2).stores({ quiz: 'date', memoire: 'carteId' })
    // Version 3 : packs signés installés après coup.
    this.version(3).stores({ packs: 'id' })
  }
}

export const base = new Base()
