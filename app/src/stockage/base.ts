// La base de données du téléphone (IndexedDB, via Dexie). Rien n'en sort.
import Dexie, { type EntityTable } from 'dexie'
import type { Carte } from '@mdl/noyau'

export interface Possession { id: string; n: number; premiere: number }
export interface PackImporte { cle?: number; nom: string; cartes: Carte[]; date: number }
export interface EvenementObtenu { id: string; numero: number; date: string }
export interface CodeUtilise { code: string; date: number }
export interface Jour { date: string }
export interface Reglage { cle: string; valeur: unknown }

class Base extends Dexie {
  possessions!: EntityTable<Possession, 'id'>
  cartesPerso!: EntityTable<Carte, 'id'>
  packsImportes!: EntityTable<PackImporte, 'cle'>
  evenements!: EntityTable<EvenementObtenu, 'id'>
  codesUtilises!: EntityTable<CodeUtilise, 'code'>
  jours!: EntityTable<Jour, 'date'>
  reglages!: EntityTable<Reglage, 'cle'>

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
  }
}

export const base = new Base()
