// L'état du jeu : chargé depuis la base du téléphone au démarrage, enregistré à chaque action.
// Les règles elles-mêmes sont dans le noyau ; ici on ne fait que les appliquer et les enregistrer.
import {
  demarrer, exporterPack, lirePack, tic, tirerBooster,
  type Carte, type CarteEvenement, type EtatChrono, type Rarete,
} from '@mdl/noyau'
import { base, type EvenementObtenu, type PackImporte } from '../stockage/base'
import { catalogue } from '../donnees'
import { CODES_DEMO } from '../codes-demo'
import { dateDuJour } from '../outils'

export type Origine = 'officiel' | 'evenement' | 'perso' | 'importe'

/** Une carte telle qu'on l'affiche : avec son origine et, pour un événement, son numéro. */
export type CarteAffichee = Carte & { origine: Origine; numero?: number; tirage?: number; nomPack?: string }

export interface ResultatBooster {
  libelle: string
  cartes: Carte[]
  nouvelles: boolean[]
}

export type ResultatCode =
  | { type: 'inconnu' }
  | { type: 'deja' }
  | { type: 'booster'; resultat: ResultatBooster }
  | { type: 'evenement'; id: string }

const CHRONO_VIDE: EtatChrono = { session: null, journee: { date: '', gagnes: 0 }, jours: [] }

class Jeu {
  pret = $state(false)
  possessions = $state<Record<string, number>>({})
  boosters = $state(0)
  sansRare = $state(0)
  ouverts = $state(0)
  vitesse = $state(1)
  chrono = $state<EtatChrono>(CHRONO_VIDE)
  codes = $state<string[]>([])
  perso = $state<Carte[]>([])
  importes = $state<PackImporte[]>([])
  evenements = $state<EvenementObtenu[]>([])
  brouillon = $state<Carte | null>(null)
  /** L'écran d'accueil du premier lancement a été lu. */
  accueilVu = $state(true)

  /** Nombre de cartes officielles différentes possédées. */
  nombreOfficielles = $derived(catalogue.officielles.filter((c) => (this.possessions[c.id] ?? 0) > 0).length)

  async charger() {
    const [possessions, reglages, jours, codes, perso, importes, evenements] = await Promise.all([
      base.possessions.toArray(), base.reglages.toArray(), base.jours.toArray(), base.codesUtilises.toArray(),
      base.cartesPerso.toArray(), base.packsImportes.toArray(), base.evenements.toArray(),
    ])
    const r = Object.fromEntries(reglages.map((x) => [x.cle, x.valeur]))
    this.possessions = Object.fromEntries(possessions.map((p) => [p.id, p.n]))
    this.sansRare = (r.sansRare as number) ?? 0
    this.ouverts = (r.ouverts as number) ?? 0
    this.vitesse = (r.vitesse as number) ?? 1
    this.brouillon = (r.brouillon as Carte) ?? null
    this.accueilVu = r.accueilVu === true
    this.chrono = {
      session: (r.session as EtatChrono['session']) ?? null,
      journee: (r.journee as EtatChrono['journee']) ?? { date: '', gagnes: 0 },
      jours: jours.map((j) => j.date).sort(),
    }
    this.codes = codes.map((c) => c.code)
    this.perso = perso
    this.importes = importes
    this.evenements = evenements
    if (r.initialise) this.boosters = (r.boosters as number) ?? 0
    else {
      this.boosters = 1 // booster de bienvenue
      await this.regler({ initialise: true, boosters: 1 })
    }
    this.pret = true
  }

  private regler(valeurs: Record<string, unknown>) {
    return base.reglages.bulkPut(Object.entries(valeurs).map(([cle, valeur]) => ({ cle, valeur: $state.snapshot(valeur) })))
  }

  async fermerAccueil() {
    this.accueilVu = true
    await this.regler({ accueilVu: true })
  }

  /* ---------- Compteur de manif ---------- */

  async demarrerManif() {
    this.chrono = { ...this.chrono, session: demarrer(Date.now()) }
    await this.regler({ session: this.chrono.session })
  }

  async terminerManif() {
    await this.avancer()
    this.chrono = { ...this.chrono, session: null }
    await this.regler({ session: null })
  }

  async changerVitesse(v: number) {
    await this.avancer() // le temps déjà écoulé est compté à l'ancienne vitesse
    this.vitesse = v
    await this.regler({ vitesse: v })
  }

  /** Fait avancer le compteur. Renvoie ce qui a été gagné, pour l'annoncer. */
  async avancer(): Promise<{ nouveauxBoosters: number; jourValide: boolean }> {
    if (!this.chrono.session) return { nouveauxBoosters: 0, jourValide: false }
    const date = dateDuJour()
    const r = tic($state.snapshot(this.chrono) as EtatChrono, Date.now(), this.vitesse, date)
    this.chrono = r.etat
    this.boosters += r.nouveauxBoosters
    await this.regler({ session: r.etat.session, journee: r.etat.journee, boosters: this.boosters })
    if (r.jourValide) await base.jours.put({ date })
    return r
  }

  /* ---------- Boosters ---------- */

  /** Ouvre un booster. Avec un minimum de rareté (code de stand), il ne coûte rien. */
  async ouvrirBooster(libelle = 'Booster', minimum?: Rarete): Promise<ResultatBooster | null> {
    if (!minimum && this.boosters < 1) return null
    const { cartes, sansRare } = tirerBooster(catalogue.officielles, this.sansRare, Math.random, minimum)
    const dejaVues = new Set(Object.keys(this.possessions).filter((id) => this.possessions[id] > 0))
    const nouvelles = cartes.map((c) => {
      const nouvelle = !dejaVues.has(c.id)
      dejaVues.add(c.id) // un doublon dans le même booster n'est nouveau qu'une fois
      return nouvelle
    })
    const maintenant = Date.now()
    const possessions = { ...this.possessions }
    for (const c of cartes) possessions[c.id] = (possessions[c.id] ?? 0) + 1
    this.possessions = possessions
    if (!minimum) this.boosters--
    this.sansRare = sansRare
    this.ouverts++
    await base.transaction('rw', base.possessions, base.reglages, async () => {
      await base.possessions.bulkPut([...new Set(cartes.map((c) => c.id))].map((id) => ({ id, n: possessions[id], premiere: maintenant })))
      await this.regler({ boosters: this.boosters, sansRare, ouverts: this.ouverts })
    })
    return { libelle, cartes, nouvelles }
  }

  /** Utilise un code de stand. En démo il est tapé ; à l'étape 4, il viendra d'un QR signé. */
  async utiliserCode(saisie: string): Promise<ResultatCode> {
    const code = saisie.trim().toUpperCase()
    const def = CODES_DEMO[code]
    if (!def) return { type: 'inconnu' }
    if (this.codes.includes(code)) return { type: 'deja' }
    this.codes = [...this.codes, code]
    await base.codesUtilises.put({ code, date: Date.now() })
    if ('evenement' in def) {
      const ev = catalogue.evenements[def.evenement]
      const obtenu: EvenementObtenu = { id: ev.id, numero: 1 + Math.floor(Math.random() * ev.tirage), date: dateDuJour() }
      this.evenements = [...this.evenements.filter((e) => e.id !== ev.id), obtenu]
      await base.evenements.put(obtenu)
      return { type: 'evenement', id: ev.id }
    }
    const resultat = await this.ouvrirBooster(def.libelle, def.minimum)
    return { type: 'booster', resultat: resultat! }
  }

  /* ---------- Toutes les cartes visibles ---------- */

  /** Retrouve une carte, quelle que soit son origine. Renvoie null si on ne la possède pas. */
  carte(id: string): CarteAffichee | null {
    const off = catalogue.parId[id]
    if (off) return (this.possessions[id] ?? 0) > 0 ? { ...off, origine: 'officiel' } : null
    const ev = this.evenements.find((e) => e.id === id)
    if (ev && catalogue.evenements[id]) {
      const c: CarteEvenement = catalogue.evenements[id]
      return { ...c, origine: 'evenement', numero: ev.numero, tirage: c.tirage }
    }
    const perso = this.perso.find((c) => c.id === id)
    if (perso) return { ...perso, origine: 'perso' }
    for (const p of this.importes) {
      const c = p.cartes.find((x) => x.id === id)
      if (c) return { ...c, origine: 'importe', nomPack: p.nom }
    }
    return null
  }

  /** Une carte existe-t-elle, même si on ne la possède pas encore ? (pour les liens « à trouver ») */
  existe(id: string): boolean {
    return !!catalogue.parId[id] || !!this.carte(id)
  }

  /* ---------- Éditeur ---------- */

  async sauverBrouillon(c: Carte | null) {
    this.brouillon = c
    await this.regler({ brouillon: c })
  }

  async enregistrerPerso(c: Carte): Promise<Carte> {
    const carte = $state.snapshot(c) as Carte
    if (!carte.id) carte.id = 'perso-' + Date.now().toString(36)
    const existe = this.perso.some((x) => x.id === carte.id)
    this.perso = existe ? this.perso.map((x) => (x.id === carte.id ? carte : x)) : [...this.perso, carte]
    await base.cartesPerso.put(carte)
    return carte
  }

  async supprimerPerso(id: string) {
    this.perso = this.perso.filter((c) => c.id !== id)
    await base.cartesPerso.delete(id)
  }

  exporter(nom: string): string {
    return exporterPack(nom, $state.snapshot(this.perso) as Carte[])
  }

  /** @throws Error avec un message à montrer */
  async importer(texte: string): Promise<number> {
    const lu = lirePack(texte, catalogue.familles, 'imp-' + Date.now().toString(36))
    const pack: PackImporte = { nom: lu.nom, cartes: lu.cartes, date: Date.now() }
    pack.cle = await base.packsImportes.add(pack)
    this.importes = [...this.importes, pack]
    return lu.cartes.length
  }

  /* ---------- Tout effacer ---------- */

  async toutEffacer() {
    await base.delete()
    location.hash = ''
    location.reload()
  }
}

export const jeu = new Jeu()
