// Le quiz du jour, le chat et son quartier.
// Les règles sont dans le noyau (quiz.ts, mascotte.ts) ; ici on les applique et on enregistre.
import {
  ajouterFragment, apresReponse, dort, joursEntre, pointsPourReponse, questionsDuJour, stade,
  type Carte, type Souvenir,
} from '@mdl/noyau'
import { base, type QuizDuJour } from '../stockage/base'
import { catalogue } from '../donnees'
import { dateDuJour } from '../outils'
import { jeu } from './jeu.svelte'

export interface ResultatReponse {
  juste: boolean
  points: number
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
  /** Graine propre à ce téléphone : deux personnes n'ont pas les mêmes questions le même jour. */
  private graine = ''

  stade = $derived(stade(this.points))
  dort = $derived(dort(this.dernierQuiz, dateDuJour(), joursEntre))

  async charger() {
    const [reglages, memoire] = await Promise.all([base.reglages.toArray(), base.memoire.toArray()])
    const r = Object.fromEntries(reglages.map((x) => [x.cle, x.valeur]))
    this.nomChat = (r.nomChat as string) ?? ''
    this.points = (r.points as number) ?? 0
    this.fragments = (r.fragments as number) ?? 0
    this.constructions = (r.constructions as Record<string, number>) ?? {}
    this.dernierQuiz = (r.dernierQuiz as string) ?? null
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
    const points = pointsPourReponse(juste, jeu.chrono.jours.includes(date))

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
      await this.regler({ points: this.points, dernierQuiz: date, constructions: this.constructions, fragments: this.fragments })
    })
    return { juste, points, famille, fragment, booster }
  }
}

export const quartier = new Quartier()
