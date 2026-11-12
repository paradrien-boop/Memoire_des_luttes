// Le quiz du jour (chaque question est une bataille), le personnage et son équipement, le chat et son quartier.
// Les règles sont dans le noyau (quiz.ts, mascotte.ts, equipement.ts, bataille.ts) ; ici on les applique et on enregistre.
import {
  ajouterFragment, apresReponse, bonusDePoints, dort, ennemiPour, equipement, hasardDepuis, joursEntre,
  pointsDeBataille, pointsPourReponse, questionsDuJour, retirerUneMauvaise, stade, utilisationsParJour,
  type Carte, type Ennemi, type Souvenir,
} from '@mdl/noyau'
import { base, type QuizDuJour } from '../stockage/base'
import { catalogue } from '../donnees'
import { dateDuJour } from '../outils'
import { jeu } from './jeu.svelte'

/** L'apparence du personnage, choisie par chaque personne. */
export interface Apparence { teint: number; coiffure: number }

export interface ResultatReponse {
  juste: boolean
  points: number
  /** L'adversaire de cette bataille. */
  ennemi: Ennemi | null
  famille: string
  /** Un fragment de booster gagné (les 3 bonnes réponses du jour). */
  fragment: boolean
  /** Un booster complété grâce aux fragments. */
  booster: boolean
}

class Quartier {
  pret = $state(false)
  nomChat = $state('')
  points = $state(0)
  fragments = $state(0)
  /** Bonnes réponses par famille de cartes : chaque famille construit un élément du quartier. */
  constructions = $state<Record<string, number>>({})
  dernierQuiz = $state<string | null>(null)
  memoire = $state<Record<string, Souvenir>>({})
  jour = $state<QuizDuJour | null>(null)
  apparence = $state<Apparence>({ teint: 1, coiffure: 0 })
  batailles = $state(0)
  /** Utilisations des pouvoirs aujourd'hui, par famille d'objet. */
  pouvoirs = $state<{ date: string; utilises: Record<string, number> }>({ date: '', utilises: {} })
  /** Graine propre à ce téléphone : deux personnes n'ont pas les mêmes questions le même jour. */
  private graine = ''

  stade = $derived(stade(this.points))
  /** Nombre de cartes différentes possédées, par famille : il fait monter les objets et construit le quartier. */
  cartesParFamille = $derived.by(() => {
    const n: Record<string, number> = {}
    for (const c of catalogue.officielles) if ((jeu.possessions[c.id] ?? 0) > 0) n[c.fam] = (n[c.fam] ?? 0) + 1
    return n
  })
  /** Niveau de chaque objet du personnage (0 = pas encore gagné). */
  objets = $derived(equipement(this.cartesParFamille))
  dort = $derived(dort(this.dernierQuiz, dateDuJour(), joursEntre))

  async charger() {
    const [reglages, memoire] = await Promise.all([base.reglages.toArray(), base.memoire.toArray()])
    const r = Object.fromEntries(reglages.map((x) => [x.cle, x.valeur]))
    this.nomChat = (r.nomChat as string) ?? ''
    this.points = (r.points as number) ?? 0
    this.fragments = (r.fragments as number) ?? 0
    this.constructions = (r.constructions as Record<string, number>) ?? {}
    this.dernierQuiz = (r.dernierQuiz as string) ?? null
    this.apparence = (r.apparence as Apparence) ?? { teint: 1, coiffure: 0 }
    this.batailles = (r.batailles as number) ?? 0
    this.pouvoirs = (r.pouvoirs as Quartier['pouvoirs']) ?? { date: '', utilises: {} }
    this.graine = (r.graine as string) ?? ''
    if (!this.graine) {
      this.graine = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('')
      await this.regler({ graine: this.graine })
    }
    this.memoire = Object.fromEntries(memoire.map((s) => [s.carteId, s]))
    this.pret = true
  }

  private regler(valeurs: Record<string, unknown>) {
    return base.reglages.bulkPut(Object.entries(valeurs).map(([cle, valeur]) => ({ cle, valeur: $state.snapshot(valeur) })))
  }

  /** Cartes sur lesquelles on peut être interrogé : les cartes officielles possédées. */
  possedees(): Carte[] {
    return catalogue.officielles.filter((c) => (jeu.possessions[c.id] ?? 0) > 0)
  }

  /** Prépare le quiz du jour (ou reprend celui déjà commencé aujourd'hui). */
  async preparerJour() {
    const date = dateDuJour()
    if (this.jour?.date === date && this.jour.questions.length) return
    const enregistre = await base.quiz.get(date)
    if (enregistre?.questions.length) { this.jour = enregistre; return }
    const questions = questionsDuJour(this.possedees(), $state.snapshot(this.memoire) as Record<string, Souvenir>, date, this.graine)
    this.jour = { date, questions, reponses: questions.map(() => null) }
    if (questions.length) await base.quiz.put($state.snapshot(this.jour) as QuizDuJour)
  }

  /** Donner une carte rapporte un fragment de booster, une fois par jour au plus. */
  async bonusDon(): Promise<{ fragment: boolean; booster: boolean }> {
    const date = dateDuJour()
    const dernier = (await base.reglages.get('dernierDon'))?.valeur
    if (dernier === date) return { fragment: false, booster: false }
    const f = ajouterFragment(this.fragments)
    this.fragments = f.fragments
    await jeu.ajouterBoosters(f.boosters)
    await this.regler({ fragments: this.fragments, dernierDon: date })
    return { fragment: true, booster: f.boosters > 0 }
  }

  async changerApparence(a: Apparence) {
    this.apparence = a
    await this.regler({ apparence: a })
  }

  /** L'adversaire de la question i du jour (un chef possible pour la dernière, si sa série est complète). */
  ennemi(i: number): Ennemi | null {
    const q = this.jour?.questions[i]
    if (!q) return null
    const carte = catalogue.parId[q.carteId]
    if (!carte) return null
    const derniere = i === (this.jour!.questions.length - 1)
    return ennemiPour({ ...carte, serie: catalogue.officielles.find((c) => c.id === carte.id)?.serie }, catalogue.ennemis, hasardDepuis(this.graine + this.jour!.date + i), jeu.seriesCompletes, derniere)
  }

  /** Utilisations restantes aujourd'hui du pouvoir d'un objet. */
  restants(famille: string): number {
    const utilises = this.pouvoirs.date === dateDuJour() ? (this.pouvoirs.utilises[famille] ?? 0) : 0
    return Math.max(0, utilisationsParJour(this.objets[famille] ?? 0) - utilises)
  }

  /** Utilise un pouvoir (porte-voix, banderole, livre). @returns false s'il n'en reste plus */
  async utiliserPouvoir(famille: string): Promise<boolean> {
    if (this.restants(famille) < 1) return false
    const date = dateDuJour()
    const utilises = this.pouvoirs.date === date ? { ...this.pouvoirs.utilises } : {}
    utilises[famille] = (utilises[famille] ?? 0) + 1
    this.pouvoirs = { date, utilises }
    await this.regler({ pouvoirs: this.pouvoirs })
    return true
  }

  /** Le porte-voix : renvoie la réponse à retirer, ou null s'il n'y en a plus à retirer. */
  async porteVoix(i: number, dejaRetirees: number[]): Promise<number | null> {
    const q = this.jour?.questions[i]
    if (!q) return null
    const r = retirerUneMauvaise(q.choix, q.bonne, dejaRetirees, Math.random)
    if (r === null || !(await this.utiliserPouvoir('chant'))) return null
    return r
  }

  async nommer(nom: string) {
    this.nomChat = nom.trim().slice(0, 30)
    await this.regler({ nomChat: this.nomChat })
  }

  async repondre(i: number, choix: number): Promise<ResultatReponse | null> {
    const jour = this.jour
    if (!jour || jour.reponses[i] !== null) return null
    const q = jour.questions[i]
    const date = jour.date
    const juste = choix === q.bonne
    const famille = catalogue.parId[q.carteId]?.fam ?? 'evenement'
    const ennemi = this.ennemi(i)
    // Une bataille gagnée : points de base (doublés un jour de manif), bonus des objets, double contre un chef.
    const points = juste ? pointsDeBataille(pointsPourReponse(true, jeu.chrono.jours.includes(date)), bonusDePoints(this.objets), !!ennemi?.chef) : 0
    if (juste) this.batailles++

    jour.reponses[i] = choix
    this.points += points
    this.dernierQuiz = date
    if (juste) this.constructions = { ...this.constructions, [famille]: (this.constructions[famille] ?? 0) + 1 }
    const souvenir = apresReponse(this.memoire[q.carteId], q.carteId, juste, date)
    this.memoire = { ...this.memoire, [q.carteId]: souvenir }

    let fragment = false, booster = false
    const fini = jour.reponses.every((r) => r !== null)
    if (fini && jour.reponses.every((r, k) => r === jour.questions[k].bonne)) {
      const f = ajouterFragment(this.fragments)
      this.fragments = f.fragments
      fragment = true
      booster = f.boosters > 0
      await jeu.ajouterBoosters(f.boosters)
    }
    await base.transaction('rw', base.quiz, base.memoire, base.reglages, async () => {
      await base.quiz.put($state.snapshot(jour) as QuizDuJour)
      await base.memoire.put(souvenir)
      await this.regler({ points: this.points, dernierQuiz: date, constructions: this.constructions, fragments: this.fragments, batailles: this.batailles })
    })
    return { juste, points, ennemi, famille, fragment, booster }
  }
}

export const quartier = new Quartier()
