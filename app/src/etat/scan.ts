// Ce qui se passe après un scan (ou un code tapé) : on annonce et on montre ce qui a été gagné.
import { jeu } from './jeu.svelte'
import { ui } from './interface.svelte'

/** @returns true si le QR a donné quelque chose */
export async function utiliserQr(texte: string): Promise<boolean> {
  const r = await jeu.traiterQr(texte)
  switch (r.type) {
    case 'refuse':
      ui.annoncer(r.raison)
      return false
    case 'garde':
      ui.scanner = false
      ui.annoncer(`Limite de cartes du jour atteinte : ton booster spécial (${r.libelle}) est gardé. Ouvre-le demain, dans Agir.`)
      return true
    case 'deja':
      ui.annoncer('Ce QR a déjà été utilisé sur ce téléphone.')
      return false
    case 'booster':
      ui.scanner = false
      ui.booster = r.resultat
      return true
    case 'evenement':
      ui.annoncer("Carte d'événement ajoutée à ton album !")
      ui.ouvrirCarte(r.id)
      return true
    case 'carte':
      ui.annoncer(`Carte reçue : ${r.titre}`)
      ui.ouvrirCarte(r.id)
      return true
    case 'perso':
      ui.annoncer(`Carte perso reçue : ${r.titre}`)
      ui.ouvrirCarte(r.id)
      return true
  }
}
