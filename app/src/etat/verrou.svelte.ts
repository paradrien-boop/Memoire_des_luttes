// Mode discret : un code d'ouverture facultatif.
// Il protège d'un coup d'œil (téléphone prêté, posé, ou regardé par-dessus l'épaule),
// pas d'un examen technique du téléphone : pour cela, il y a « Tout effacer ».
// Le code n'est jamais enregistré : seulement son empreinte SHA-256, avec un sel.
import { base } from '../stockage/base'

interface Empreinte { sel: string; hash: string }

const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('')

async function hacher(sel: string, code: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sel + ':' + code)))
}

/** Après combien de temps en arrière-plan l'app se reverrouille. */
const DELAI_VERROU = 60_000
const ESSAIS_AVANT_ATTENTE = 5

class Verrou {
  actif = $state(false)
  verrouille = $state(false)
  attenteJusqua = $state(0)
  private empreinte: Empreinte | null = null
  private essais = 0
  private cacheeDepuis = 0

  async charger() {
    this.empreinte = ((await base.reglages.get('verrou'))?.valeur as Empreinte) ?? null
    this.actif = !!this.empreinte
    this.verrouille = this.actif
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.cacheeDepuis = Date.now()
      else if (this.actif && this.cacheeDepuis && Date.now() - this.cacheeDepuis > DELAI_VERROU) this.verrouille = true
    })
  }

  static codeValide(code: string) {
    return /^\d{4,8}$/.test(code)
  }

  async definir(code: string) {
    if (!Verrou.codeValide(code)) throw new Error('Le code doit avoir de 4 à 8 chiffres.')
    const sel = hex(crypto.getRandomValues(new Uint8Array(16)))
    this.empreinte = { sel, hash: await hacher(sel, code) }
    await base.reglages.put({ cle: 'verrou', valeur: this.empreinte })
    this.actif = true
  }

  async retirer() {
    this.empreinte = null
    await base.reglages.delete('verrou')
    this.actif = false
    this.verrouille = false
  }

  /** Vérifie le code. Après 5 erreurs, il faut attendre 30 secondes entre chaque essai. */
  async ouvrir(code: string): Promise<boolean> {
    if (!this.empreinte || Date.now() < this.attenteJusqua) return false
    if ((await hacher(this.empreinte.sel, code)) === this.empreinte.hash) {
      this.essais = 0
      this.verrouille = false
      return true
    }
    this.essais++
    if (this.essais >= ESSAIS_AVANT_ATTENTE) this.attenteJusqua = Date.now() + 30_000
    return false
  }

  verrouiller() {
    if (this.actif) this.verrouille = true
  }
}

export const verrou = new Verrou()
