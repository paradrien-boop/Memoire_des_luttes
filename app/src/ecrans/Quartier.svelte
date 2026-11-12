<script lang="ts">
  import { CARTES_MIN_QUIZ, objetDuPouvoir, ELEMENTS, FRAGMENTS_PAR_BOOSTER, niveau, STADES, versStadeSuivant } from '@mdl/noyau'
  import Entete from '../composants/Entete.svelte'
  import Scene from '../dessins/Scene.svelte'
  import Arene from '../composants/Arene.svelte'
  import Equipement from '../composants/Equipement.svelte'
  import { profil } from '../etat/profil.svelte'
  import { quartier, type ResultatReponse } from '../etat/quartier.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { catalogue } from '../donnees'
  import { dateDuJour } from '../outils'

  /** Accessoires gagnés en complétant des séries de l'album. */
  const ACCESSOIRES: Record<string, string> = { '72j': 'cocarde', comm: 'foulard', idees: 'partition' }

  let nom = $state('')
  let renommer = $state(false)
  let resultat = $state<ResultatReponse | null>(null)
  /** Réponses retirées par le porte-voix, réponses déjà tentées avant la seconde chance. */
  let retirees = $state<number[]>([])
  let secondeEssai = $state<number[]>([])
  let choixEnAttente = $state<number | null>(null)
  let indice = $state('')

  quartier.preparerJour()

  // Le quartier avance avec les batailles gagnées ET avec les cartes possédées de chaque famille.
  const niveaux = $derived(Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, niveau((quartier.constructions[f] ?? 0) + (quartier.cartesParFamille[f] ?? 0))])))
  const accessoires = $derived(jeu.seriesCompletes.map((s) => ACCESSOIRES[s]).filter(Boolean))
  const jourDeManif = $derived(jeu.chrono.jours.includes(dateDuJour()))
  const description = $derived.by(() => {
    const construits = Object.entries(niveaux).filter(([, n]) => n > 0).map(([f]) => ELEMENTS[f])
    const chat = `${quartier.nomChat || 'Ton chat'}, ${STADES[quartier.stade].nom.toLowerCase()}${quartier.dort ? ', endormi' : ''}`
    return `${chat}. ${construits.length ? 'Dans le quartier : ' + construits.join(', ') + '.' : 'La rue est encore grise et vide.'}`
  })

  const jour = $derived(quartier.jour)
  const courante = $derived(jour ? jour.reponses.findIndex((r) => r === null) : -1)
  /** La question affichée : celle qu'on vient de répondre (pour voir la correction), sinon la suivante. */
  let affichee = $state<number | null>(null)
  const index = $derived(affichee ?? courante)
  const question = $derived(jour && index >= 0 ? jour.questions[index] : null)
  const reponse = $derived(jour && index >= 0 ? jour.reponses[index] : null)
  const justes = $derived(jour ? jour.reponses.filter((r, i) => r === jour.questions[i].bonne).length : 0)

  const ennemiActuel = $derived(jour && index >= 0 ? quartier.ennemi(index) : null)
  const etatBataille = $derived<'attente' | 'victoire' | 'defaite' | 'seconde'>(
    choixEnAttente !== null ? 'seconde' : reponse === null ? 'attente' : reponse === question?.bonne ? 'victoire' : 'defaite',
  )

  async function choisir(i: number) {
    if (!question || reponse !== null) return
    // Une erreur, et la banderole est là : on propose une seconde chance avant d'enregistrer la défaite.
    if (i !== question.bonne && quartier.restants('seconde-chance') > 0 && !secondeEssai.length) { choixEnAttente = i; return }
    await enregistrer(i)
  }

  async function enregistrer(i: number) {
    choixEnAttente = null
    affichee = index
    resultat = await quartier.repondre(index, i)
    if (resultat?.booster) ui.annoncer('5 fragments réunis : un booster de plus !')
  }

  async function brandir() {
    if (choixEnAttente === null || !(await quartier.utiliserPouvoir('seconde-chance'))) return
    secondeEssai = [choixEnAttente]
    choixEnAttente = null
    ui.annoncer('La banderole se déploie : la bataille reprend !')
  }

  async function porteVoix() {
    const r = await quartier.porteVoix(index, [...retirees, ...secondeEssai])
    if (r === null) ui.annoncer('Il ne reste plus de mauvaise réponse à faire taire.')
    else retirees = [...retirees, r]
  }

  async function livre() {
    if (!question || !(await quartier.utiliserPouvoir('indice'))) return
    const c = catalogue.parId[question.carteId]
    const famille = catalogue.familles[c?.fam]?.libelle ?? ''
    const serie = catalogue.series.find((s) => s.cartes.includes(question.carteId))?.nom
    // Pour une question de date, on ne donne évidemment pas les dates.
    indice = question.type === 'annee' ? `une carte de la famille « ${famille} »${serie ? `, série « ${serie} »` : ''}.` : `une carte de la famille « ${famille} »${c?.dates ? `, ${c.dates}` : ''}.`
  }

  function suivante() { affichee = null; resultat = null; retirees = []; secondeEssai = []; choixEnAttente = null; indice = '' }

  async function donnerNom(e: SubmitEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    await quartier.nommer(nom)
    renommer = false
  }
</script>

<Entete surtitre="Ton quartier" titre={quartier.nomChat || 'Quartier'} marque={STADES[quartier.stade].nom.replace(' ', '\n')} />

<div class="pile">
  <Scene {niveaux} stade={quartier.stade} dort={quartier.dort} {accessoires} pancarte={jourDeManif} {description}
    personnage={{ teint: quartier.apparence.teint, coiffure: quartier.apparence.coiffure, equipe: quartier.equipe }}
    foule={Math.min(6, jeu.chrono.jours.length)} />

  <div class="progression">
    <div>
      <div class="surtitre">{STADES[quartier.stade].nom} · {quartier.points} points</div>
      <div class="barre" role="progressbar" aria-label="Vers le stade suivant" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(versStadeSuivant(quartier.points) * 100)}>
        <i style="width: {versStadeSuivant(quartier.points) * 100}%"></i>
      </div>
      {#if quartier.stade < STADES.length - 1}<p class="discret petit">Prochain stade : {STADES[quartier.stade + 1].nom.toLowerCase()} à {STADES[quartier.stade + 1].points} points</p>{/if}
    </div>
    <div class="fragments" aria-label="{quartier.fragments} fragments de booster sur {FRAGMENTS_PAR_BOOSTER}">
      {#each Array(FRAGMENTS_PAR_BOOSTER) as _, i (i)}<span class:plein={i < quartier.fragments}></span>{/each}
      <small>fragments de booster</small>
    </div>
  </div>

  {#if !profil.personnage}
    <p class="note">Crée ton personnage dans ton <a href="#plus">profil</a> : tu le personnalises une fois, il est enregistré, et il porte ensuite les objets gagnés avec ta collection.</p>
  {/if}

  {#if !quartier.nomChat || renommer}
    <form class="encart" onsubmit={donnerNom}>
      <h2>{renommer ? 'Renommer ton chat' : 'Ce chat est à toi'}</h2>
      <p class="petit">Il grandira avec tes bonnes réponses, et son quartier se construira avec ce que tu apprends. Comment s'appelle-t-il ?</p>
      <div class="ligne">
        <input id="nom-chat" bind:value={nom} maxlength="30" placeholder="Son nom" aria-label="Nom du chat" />
        <button class="rouge" disabled={!nom.trim()}>C'est son nom</button>
      </div>
    </form>
  {:else if quartier.dort}
    <p class="note">{quartier.nomChat} dormait en t'attendant. Réponds à une question pour le réveiller : il n'a rien perdu.</p>
  {/if}

  <section class="encart quiz">
    <div class="ligne entre">
      <div><div class="surtitre">Batailles du jour{jourDeManif ? ' · jour de manif : points doublés' : ''}</div><h2>{!jour?.questions.length ? 'Batailles du jour' : index === -1 ? 'Batailles terminées' : `Bataille ${index + 1} sur ${jour.questions.length}`}</h2></div>
    </div>

    {#if !jour}
      <p class="discret">Préparation…</p>
    {:else if !jour.questions.length}
      <p>Les batailles commencent quand tu as <b>{CARTES_MIN_QUIZ} cartes</b> dans ton album. Tu en as {jeu.nombreOfficielles}. Ouvre des boosters en manif !</p>
    {:else if index === -1}
      <p class="bilan">{justes}/{jour.questions.length}</p>
      <p>{justes === jour.questions.length ? `Trois batailles gagnées, sans faute ! Tu gagnes un fragment de booster (${quartier.fragments}/${FRAGMENTS_PAR_BOOSTER}).` : 'Les cartes des batailles perdues reviendront bientôt, pour que tu prennes ta revanche.'}</p>
      <p class="discret">De nouveaux adversaires t'attendent demain.</p>
    {:else if question}
      <Arene ennemi={ennemiActuel} etat={etatBataille} />
      {#if ennemiActuel && reponse === null && etatBataille === 'attente'}<p class="discret petit">{ennemiActuel.description}</p>{/if}
      <p class="enonce">{question.enonce}</p>
      {#if question.extrait}<blockquote>{question.extrait}</blockquote>{/if}
      {#if indice}<p class="note">Indice du livre : {indice}</p>{/if}

      {#if reponse === null && etatBataille !== 'seconde'}
        <div class="pouvoirs">
          {#if objetDuPouvoir(quartier.equipe, 'retirer')}
            <button disabled={!quartier.restants('retirer')} onclick={porteVoix}>📣 Porte-voix ({quartier.restants('retirer')})</button>
          {/if}
          {#if objetDuPouvoir(quartier.equipe, 'indice')}
            <button disabled={!quartier.restants('indice') || !!indice} onclick={livre}>📖 Livre ({quartier.restants('indice')})</button>
          {/if}
        </div>
      {/if}

      <div class="choix">
        {#each question.choix as c, i (i)}
          {#if !retirees.includes(i)}
            <button
              class="choix-bouton"
              class:juste={reponse !== null && i === question.bonne}
              class:faux={(reponse === i && i !== question.bonne) || secondeEssai.includes(i)}
              disabled={reponse !== null || secondeEssai.includes(i) || etatBataille === 'seconde'}
              onclick={() => choisir(i)}
            >{c}</button>
          {/if}
        {/each}
      </div>

      {#if etatBataille === 'seconde'}
        <div class="correction">
          <b>Raté… mais ta banderole peut changer le cours de la bataille.</b>
          <div class="ligne">
            <button class="rouge" onclick={brandir}>Brandir la banderole ({quartier.restants('seconde-chance')})</button>
            <button onclick={() => enregistrer(choixEnAttente!)}>Accepter la défaite</button>
          </div>
        </div>
      {/if}

      {#if reponse !== null}
        <div class="correction" class:ok={reponse === question.bonne}>
          <b>{reponse === question.bonne ? `Bataille gagnée ! +${resultat?.points ?? 10} points` : `Bataille perdue. La bonne réponse : ${question.choix[question.bonne]}`}</b>
          {#if reponse === question.bonne && resultat}<span> · {ELEMENTS[resultat.famille]} avance.</span>{/if}
          {#if question.explication}<p>{question.explication}</p>{/if}
        </div>
        <div class="ligne">
          <button onclick={() => ui.ouvrirCarte(question.carteId)}>Lire la carte</button>
          <button class="encre" onclick={suivante}>{courante === -1 ? 'Voir le bilan' : 'Bataille suivante'}</button>
        </div>
      {/if}
    {/if}
  </section>

  <section class="encart">
    <div class="surtitre">{quartier.batailles} bataille{quartier.batailles > 1 ? 's' : ''} gagnée{quartier.batailles > 1 ? 's' : ''}</div>
    <h2>{profil.personnage?.nom ?? 'Ton personnage'}</h2>
    <Equipement />
  </section>

  {#if quartier.nomChat && !renommer}
    <div><button class="lien" onclick={() => { nom = quartier.nomChat; renommer = true }}>Renommer {quartier.nomChat}</button></div>
  {/if}

  <section class="pile serree">
    <h2>Ce qui se construit</h2>
    <p class="discret petit">Chaque bataille gagnée et chaque carte d'une famille font avancer son élément : esquissé, construit, puis animé. Les jours de manif, le quartier se remplit de monde.</p>
    <ul class="elements">
      {#each Object.entries(ELEMENTS) as [f, e] (f)}
        <li><span>{catalogue.familles[f]?.libelle ?? f}</span><span class="nom">{e}</span><span class="niveau">{['—', 'esquissé', 'construit', 'animé'][niveaux[f]]}</span></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .petit { font-size: 13px; }
  .serree { gap: 6px; }
  .entre { justify-content: space-between; }
  .progression { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
  .progression > div:first-child { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 6px; }
  .barre { height: 10px; border: 2px solid var(--encre); position: relative; }
  .barre i { position: absolute; inset: 0 auto 0 0; background: var(--rouge); }
  .fragments { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
  .fragments span { width: 14px; height: 14px; border: 2px solid var(--rouge); transform: rotate(45deg); }
  .fragments span.plein { background: var(--rouge); }
  .fragments small { width: 100%; color: var(--discret); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  .enonce { font-family: var(--f-texte); font-size: 18px; line-height: 1.35; font-weight: 600; }
  blockquote { margin: 0; font-family: var(--f-texte); font-style: italic; font-size: 15px; line-height: 1.45; padding: 8px 0 8px 12px; border-left: 4px solid var(--rouge); }
  .choix { display: grid; gap: 8px; }
  .choix-bouton { text-transform: none; letter-spacing: 0; font-size: 15px; text-align: left; padding: 12px 14px; background: var(--papier); }
  .choix-bouton:disabled { opacity: 1; cursor: default; }
  .choix-bouton.juste { background: var(--encre); color: var(--papier); }
  .pouvoirs { display: flex; gap: 8px; flex-wrap: wrap; }
  .pouvoirs button { padding: 6px 10px; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .choix-bouton.faux { background: var(--rouge); border-color: var(--rouge); color: var(--sur-rouge); text-decoration: line-through; }
  .correction { border-left: 4px solid var(--rouge); padding-left: 10px; display: flex; flex-direction: column; gap: 4px; }
  .correction.ok { border-color: var(--encre); }
  .correction p { font-family: var(--f-texte); font-size: 14px; }
  .bilan { font-family: var(--f-affiche); font-weight: 900; font-size: 64px; line-height: 1; color: var(--rouge); }
  .lien { border: 0; padding: 0; text-decoration: underline; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--discret); }
  .elements { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .elements li { display: grid; grid-template-columns: 7.5em 1fr auto; gap: 8px; padding: 6px 0; border-bottom: 1.5px solid var(--trait); font-size: 14px; }
  .elements .nom { font-family: var(--f-texte); }
  .elements .niveau { font-weight: 700; color: var(--rouge); }
  input { flex: 1; min-width: 0; }
</style>
