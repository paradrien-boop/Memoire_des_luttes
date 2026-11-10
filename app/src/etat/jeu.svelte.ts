// L'état du jeu : chargé depuis la base du téléphone au démarrage, enregistré à chaque action.
// Les règles elles-mêmes sont dans le noyau ; ici on ne fait que les appliquer et les enregistrer.
import {
  cleUnique, demarrer, encoderQr, exporterPack, lirePack, lireQr, tic, tirerBooster, TAILLE_MAX_QR, verifierPack, verifierQr,
  type Carte, type Confiance, type DelegationSignee, type EtatChrono, type Pack, type PackSignable, type Rarete,
} from '@mdl/noyau'
import { base, type EvenementObtenu, type PackImporte, type PackInstalle } from '../stockage/base'
import { catalogue, installerDansCatalogue, NOM_COLLECTIF, RACINES, REVOCATIONS_INTEGREES } from '../donnees'
import { CODES_DEMO } from '../codes-demo'
import { dateDuJour } from '../outils'

export type Origine = 'officiel' | 'local' | 'evenement' | 'perso' | 'importe'

/** Une carte telle qu'on l'affiche : avec son origine et, pour un événement, son numéro. */
export type CarteAffichee = Carte & { origine: Origine; numero?: number; tirage?: number; nomPack?: string; collectif?: string }

/** Ce que donne un QR scanné (ou un code tapé). */
export type ResultatQr =
  | { type: 'refuse'; raison: string }
  | { type: 'deja' }
  | { type: 'booster'; resultat: ResultatBooster }
  | { type: 'evenement'; id: string }
  | { type: 'carte'; id: string; titre: string }
  | { type: 'perso'; id: string; titre: string }

const NOM_RECUES = 'Cartes reçues'
const aleatoire = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('')

export interface ResultatBooster {
  libelle: string
  cartes: Carte[]
  nouvelles: boolean[]
}

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
  /** Packs signés installés après coup. */
  packs = $state<PackInstalle[]>([])
  /** Packs installés devenus invalides (clé révoquée, délégation expirée) : identifiant → raison. */
  packsInvalides = $state<Record<string, string>>({})
  /** L'écran d'accueil du premier lancement a été lu. */
  accueilVu = $state(true)

  /** Nombre de cartes officielles différentes possédées. */
  nombreOfficielles = $derived(catalogue.officielles.filter((c) => (this.possessions[c.id] ?? 0) > 0).length)

  async charger() {
    const [possessions, reglages, jours, codes, perso, importes, evenements, packs] = await Promise.all([
      base.possessions.toArray(), base.reglages.toArray(), base.jours.toArray(), base.codesUtilises.toArray(),
      base.cartesPerso.toArray(), base.packsImportes.toArray(), base.evenements.toArray(), base.packs.toArray(),
    ])
    this.packs = packs
    this.majCatalogue()
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

  /** Boosters gagnés autrement qu'au compteur (fragments du quiz). */
  async ajouterBoosters(n: number) {
    if (n <= 0) return
    this.boosters += n
    await this.regler({ boosters: this.boosters })
  }

  /** Les séries de l'album complétées (pour les accessoires du chat). */
  get seriesCompletes(): string[] {
    return catalogue.series.filter((s) => s.cartes.every((id) => (this.possessions[id] ?? 0) > 0)).map((s) => s.id)
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

  private async marquerUtilise(cle: string) {
    this.codes = [...this.codes, cle]
    await base.codesUtilises.put({ code: cle, date: Date.now() })
  }

  /**
   * Traite le texte d'un QR scanné ou d'un code tapé. Les QR de stand et d'événement sont vérifiés
   * (signature, émetteur, dates) ; chaque QR ne sert qu'une fois sur ce téléphone.
   */
  async traiterQr(texte: string): Promise<ResultatQr> {
    const lu = lireQr(texte)
    if (!lu) {
      // Codes tapés de démonstration : seulement en développement, page de démo et tests.
      const code = texte.trim().toUpperCase()
      const def = import.meta.env.VITE_DEMO ? CODES_DEMO[code] : undefined
      if (!def) return { type: 'refuse', raison: "Ce code ne vient pas de Mémoire des luttes. Vérifie l'orthographe ou scanne le QR." }
      if (this.codes.includes(code)) return { type: 'deja' }
      await this.marquerUtilise(code)
      if ('evenement' in def) return this.ajouterEvenement(def.evenement, 1 + Math.floor(Math.random() * catalogue.evenements[def.evenement].tirage))
      return { type: 'booster', resultat: (await this.ouvrirBooster(def.libelle, def.minimum))! }
    }

    const q = lu.contenu
    let emetteur = ''
    if (q.t === 'S' || q.t === 'E') {
      const v = verifierQr(lu, this.confiance(), this.delegationsDeConfiance(), NOM_COLLECTIF)
      if (!v.ok) return { type: 'refuse', raison: v.raison }
      emetteur = v.emetteur
    }
    const cle = cleUnique(q)
    if (this.codes.includes(cle)) return { type: 'deja' }

    switch (q.t) {
      case 'S': {
        await this.marquerUtilise(cle)
        return { type: 'booster', resultat: (await this.ouvrirBooster(`Stand · ${emetteur}`, q.m))! }
      }
      case 'E': {
        if (!catalogue.evenements[q.e] && !q.k) return { type: 'refuse', raison: "Ton app ne connaît pas encore cette carte d'événement. Mets à jour tes packs, puis rescanne." }
        await this.marquerUtilise(cle)
        return this.ajouterEvenement(q.e, q.n, catalogue.evenements[q.e] ? undefined : q.k)
      }
      case 'C': {
        const c = catalogue.parId[q.i]
        if (!c) return { type: 'refuse', raison: "Ton app ne connaît pas encore cette carte. Installe le pack qui la contient, puis rescanne." }
        await this.marquerUtilise(cle)
        this.possessions = { ...this.possessions, [c.id]: (this.possessions[c.id] ?? 0) + 1 }
        await base.possessions.put({ id: c.id, n: this.possessions[c.id], premiere: Date.now() })
        return { type: 'carte', id: c.id, titre: c.title }
      }
      case 'P': {
        // Une carte perso reçue est nettoyée comme un pack importé.
        let carte: Carte
        try { carte = lirePack(JSON.stringify({ cartes: [q.carte] }), catalogue.familles, 'recue-' + q.x).cartes[0] }
        catch { return { type: 'refuse', raison: "Cette carte est illisible." } }
        await this.marquerUtilise(cle)
        let pack = this.importes.find((p) => p.nom === NOM_RECUES)
        if (pack) {
          pack = { ...$state.snapshot(pack) as PackImporte, cartes: [...pack.cartes, carte] }
          await base.packsImportes.put(pack)
          this.importes = this.importes.map((p) => (p.cle === pack!.cle ? pack! : p))
        } else {
          pack = { nom: NOM_RECUES, cartes: [carte], date: Date.now() }
          pack.cle = await base.packsImportes.add(pack)
          this.importes = [...this.importes, pack]
        }
        return { type: 'perso', id: carte.id, titre: carte.title }
      }
    }
  }

  private async ajouterEvenement(id: string, numero: number, carte?: EvenementObtenu['carte']): Promise<ResultatQr> {
    if (this.evenements.some((e) => e.id === id)) return { type: 'deja' }
    const obtenu: EvenementObtenu = { id, numero, date: dateDuJour(), ...(carte ? { carte } : {}) }
    this.evenements = [...this.evenements, obtenu]
    await base.evenements.put(obtenu)
    return { type: 'evenement', id }
  }

  /* ---------- Échanges entre camarades ---------- */

  /** Le QR à montrer pour donner un exemplaire en double. Rien n'est retiré tant que le don n'est pas confirmé. */
  qrDon(id: string): string {
    if ((this.possessions[id] ?? 0) < 2) throw new Error('On ne peut donner que les cartes en double.')
    return encoderQr({ t: 'C', i: id, x: aleatoire() })
  }

  async confirmerDon(id: string) {
    const n = (this.possessions[id] ?? 0) - 1
    if (n < 1) return
    this.possessions = { ...this.possessions, [id]: n }
    await base.possessions.put({ id, n, premiere: Date.now() })
  }

  /** Le QR d'une carte perso à partager. @throws Error si la carte est trop longue pour un QR */
  qrPerso(c: Carte): string {
    const { id: _id, img: _img, ...carte } = $state.snapshot(c) as Carte
    const texte = encoderQr({ t: 'P', x: aleatoire(), carte })
    if (texte.length > TAILLE_MAX_QR) throw new Error('Cette carte est trop longue pour tenir dans un QR. Raccourcis ses textes, ou partage-la en pack.')
    return texte
  }

  /* ---------- Packs signés ---------- */

  confiance(): Confiance {
    const revoquees = [...REVOCATIONS_INTEGREES, ...this.packs.filter((p) => p.confiance === 'officiel').flatMap((p) => p.pack.revocations ?? [])]
    return { racines: RACINES, revoquees, date: dateDuJour() }
  }

  /** Délégations des collectifs locaux auxquels l'utilisateur fait confiance (pour leurs QR de stand). */
  delegationsDeConfiance(): DelegationSignee[] {
    return this.packs.filter((p) => p.confiance === 'local' && p.accepte && p.delegation && !this.packsInvalides[p.id]).map((p) => $state.snapshot(p.delegation!) as DelegationSignee)
  }

  /** Revérifie les packs installés (révocations, expirations) et met à jour le catalogue. */
  private majCatalogue() {
    const c = this.confiance()
    const invalides: Record<string, string> = {}
    const actifs: Pack[] = []
    for (const p of this.packs) {
      const v = verifierPack($state.snapshot(p.pack) as PackSignable, c)
      if (v.confiance === 'invalide' || v.confiance === 'non-signe') { invalides[p.id] = v.confiance === 'invalide' ? v.raison : 'Signature absente.'; continue }
      if (p.confiance === 'local' && !p.accepte) continue
      const pack = $state.snapshot(p.pack) as PackSignable
      const series = Array.isArray(pack.series) && pack.series.length ? pack.series : [{ id: 'serie-' + p.id, nom: pack.nom, cartes: pack.cartes.map((x) => x.id) }]
      actifs.push({ ...(pack as unknown as Pack), type: p.confiance, series, ...(p.collectif ? { collectif: p.collectif } : {}) })
    }
    this.packsInvalides = invalides
    installerDansCatalogue(actifs)
  }

  private async installerPackSigne(pack: PackSignable): Promise<string> {
    if (typeof pack.id !== 'string' || typeof pack.nom !== 'string' || !Array.isArray(pack.cartes)) throw new Error("Ce pack est mal formé.")
    const v = verifierPack(pack, this.confiance())
    if (v.confiance === 'invalide') throw new Error(v.raison)
    if (v.confiance === 'non-signe') throw new Error('Ce pack n\'est pas signé.')
    const prise = pack.cartes.find((c) => catalogue.origine[c.id] && catalogue.origine[c.id].packId !== pack.id)
    if (prise) throw new Error(`Ce pack utilise un identifiant de carte déjà pris par un autre pack (« ${prise.id} »).`)
    const ancien = this.packs.find((p) => p.id === pack.id)
    const installe: PackInstalle = {
      id: pack.id, pack, confiance: v.confiance, date: Date.now(),
      accepte: v.confiance === 'officiel' || (ancien?.accepte ?? false),
      ...(v.confiance === 'local' ? { collectif: v.collectif, delegation: v.delegation } : {}),
    }
    await base.packs.put(installe)
    this.packs = [...this.packs.filter((p) => p.id !== pack.id), installe]
    this.majCatalogue()
    if (v.confiance === 'officiel') return `Pack officiel « ${pack.nom} » ${ancien ? 'mis à jour' : 'installé'} : ${pack.cartes.length} cartes. Elles tombent maintenant dans les boosters.`
    return installe.accepte
      ? `Pack « ${pack.nom} » du collectif « ${v.collectif.nom} » mis à jour.`
      : `Pack du collectif « ${v.collectif.nom} » reçu. Va dans Plus, rubrique Packs, pour décider si tu lui fais confiance.`
  }

  /**
   * Cherche de nouveaux packs signés sur le site (le seul accès au réseau de l'app, et seulement sur demande).
   * L'index est publié à côté de l'app : ../packs/index.json. Chaque pack est vérifié avant installation.
   * @returns un résumé à montrer. @throws Error si le site est injoignable
   */
  async chercherPacks(): Promise<string> {
    type Entree = { id: string; nom: string; fichier: string; confiance: string; signature: string | null }
    let index: { packs: Entree[] }
    try {
      const r = await fetch(new URL('../packs/index.json', location.href), { cache: 'no-store' })
      if (!r.ok) throw new Error()
      index = await r.json()
    } catch {
      throw new Error("Impossible de joindre le site. Il faut du réseau pour chercher de nouveaux packs : réessaie à la maison.")
    }
    const signatureDe = (p: { signature?: unknown } | undefined) => (p?.signature as { valeur?: string } | undefined)?.valeur
    const aJour = (e: Entree) =>
      this.packs.some((p) => p.id === e.id && signatureDe(p.pack) === e.signature) ||
      catalogue.packs.some((p) => p.id === e.id && signatureDe(p) === e.signature)
    const nouveaux = (index.packs ?? []).filter((e) => e.signature && (e.confiance === 'officiel' || e.confiance === 'local') && !aJour(e))
    if (!nouveaux.length) return 'Tu as déjà tous les packs signés du site.'
    const messages: string[] = []
    for (const e of nouveaux) {
      try {
        const r = await fetch(new URL('../' + e.fichier, location.href), { cache: 'no-store' })
        if (!r.ok) throw new Error(`Le pack « ${e.nom} » est introuvable sur le site.`)
        messages.push(await this.importer(await r.text()))
      } catch (err) {
        messages.push(`« ${e.nom} » refusé : ${(err as Error).message}`)
      }
    }
    return messages.join(' ')
  }

  async accepterPack(id: string, accepte: boolean) {
    const p = this.packs.find((x) => x.id === id)
    if (!p) return
    const maj = { ...$state.snapshot(p) as PackInstalle, accepte }
    await base.packs.put(maj)
    this.packs = this.packs.map((x) => (x.id === id ? maj : x))
    this.majCatalogue()
  }

  async retirerPack(id: string) {
    await base.packs.delete(id)
    this.packs = this.packs.filter((x) => x.id !== id)
    this.majCatalogue()
  }

  /* ---------- Toutes les cartes visibles ---------- */

  /** Retrouve une carte, quelle que soit son origine. Renvoie null si on ne la possède pas. */
  carte(id: string): CarteAffichee | null {
    const off = catalogue.parId[id]
    if (off) {
      if ((this.possessions[id] ?? 0) < 1) return null
      const o = catalogue.origine[id]
      return { ...off, origine: o?.type ?? 'officiel', ...(o?.collectif ? { collectif: o.collectif.nom } : {}) }
    }
    const ev = this.evenements.find((e) => e.id === id)
    if (ev) {
      const c = catalogue.evenements[id] ?? (ev.carte ? { id, fam: 'manif', rar: 'evenement' as const, ...ev.carte } : null)
      if (c) return { ...c, origine: 'evenement', numero: ev.numero, tirage: c.tirage }
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

  /**
   * Importe un pack. Signé : il est vérifié puis installé (officiel) ou mis en attente (local).
   * Non signé : ses cartes vont dans l'album seulement.
   * @returns le message à montrer. @throws Error avec un message à montrer
   */
  async importer(texte: string): Promise<string> {
    let brut: unknown = null
    try { brut = JSON.parse(texte) } catch { /* lirePack donnera le bon message */ }
    if (brut && typeof brut === 'object' && (brut as PackSignable).signature) return this.installerPackSigne(brut as PackSignable)
    const lu = lirePack(texte, catalogue.familles, 'imp-' + Date.now().toString(36))
    const pack: PackImporte = { nom: lu.nom, cartes: lu.cartes, date: Date.now() }
    pack.cle = await base.packsImportes.add(pack)
    this.importes = [...this.importes, pack]
    return `${lu.cartes.length} carte(s) importée(s), non signées. Elles sont dans l'album.`
  }

  /* ---------- Tout effacer ---------- */

  async toutEffacer() {
    await base.delete()
    location.hash = ''
    location.reload()
  }
}

export const jeu = new Jeu()
