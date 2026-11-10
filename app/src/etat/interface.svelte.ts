// Ce qui est affiché par-dessus les écrans : carte ouverte, booster en cours, annonce.
import type { ResultatBooster } from './jeu.svelte'

class Interface {
  carteOuverte = $state<string | null>(null)
  booster = $state<ResultatBooster | null>(null)
  annonce = $state<{ texte: string; n: number } | null>(null)
  /** Carte perso à charger dans l'éditeur. */
  aModifier = $state<string | null>(null)

  annoncer(texte: string) {
    const n = (this.annonce?.n ?? 0) + 1
    this.annonce = { texte, n }
    setTimeout(() => { if (this.annonce?.n === n) this.annonce = null }, 2800)
  }

  ouvrirCarte(id: string) {
    this.booster = null
    this.carteOuverte = id
  }

  fermer() {
    this.carteOuverte = null
    this.booster = null
  }
}

export const ui = new Interface()
