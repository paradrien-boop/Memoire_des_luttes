<script lang="ts">
  import { CARTES_MIN_QUIZ, ELEMENTS, FRAGMENTS_PAR_BOOSTER, niveau, STADES, versStadeSuivant } from '@mdl/noyau'
  import Entete from '../composants/Entete.svelte'
  import Scene from '../dessins/Scene.svelte'
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

  quartier.preparerJour()

  const niveaux = $derived(Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, niveau(quartier.constructions[f] ?? 0)])))
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

  async function choisir(i: number) {
    if (!question || reponse !== null) return
    affichee = index
    resultat = await quartier.repondre(index, i)
    if (resultat?.booster) ui.annoncer('5 fragments réunis : un booster de plus !')
  }

  function suivante() { affichee = null; resultat = null }

  async function donnerNom(e: SubmitEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    await quartier.nommer(nom)
    renommer = false
  }
</script>

<Entete surtitre="Ton quartier" titre={quartier.nomChat || 'Quartier'} marque={STADES[quartier.stade].nom.replace(' ', '\n')} />

<div class="pile">
  <Scene {niveaux} stade={quartier.stade} dort={quartier.dort} {accessoires} pancarte={jourDeManif} {description} />

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
      <div><div class="surtitre">Quiz du jour{jourDeManif ? ' · jour de manif : points doublés' : ''}</div><h2>{!jour?.questions.length ? 'Quiz du jour' : index === -1 ? 'Quiz terminé' : `Question ${index + 1} sur ${jour.questions.length}`}</h2></div>
    </div>

    {#if !jour}
      <p class="discret">Préparation…</p>
    {:else if !jour.questions.length}
      <p>Le quiz commence quand tu as <b>{CARTES_MIN_QUIZ} cartes</b> dans ton album. Tu en as {jeu.nombreOfficielles}. Ouvre des boosters en manif !</p>
    {:else if index === -1}
      <p class="bilan">{justes}/{jour.questions.length}</p>
      <p>{justes === jour.questions.length ? `Sans faute ! Tu gagnes un fragment de booster (${quartier.fragments}/${FRAGMENTS_PAR_BOOSTER}).` : 'Les cartes ratées reviendront bientôt pour que tu les retiennes.'}</p>
      <p class="discret">Reviens demain pour de nouvelles questions.</p>
    {:else if question}
      <p class="enonce">{question.enonce}</p>
      {#if question.extrait}<blockquote>{question.extrait}</blockquote>{/if}
      <div class="choix">
        {#each question.choix as c, i (i)}
          <button
            class="choix-bouton"
            class:juste={reponse !== null && i === question.bonne}
            class:faux={reponse === i && i !== question.bonne}
            disabled={reponse !== null}
            onclick={() => choisir(i)}
          >{c}</button>
        {/each}
      </div>
      {#if reponse !== null}
        <div class="correction" class:ok={reponse === question.bonne}>
          <b>{reponse === question.bonne ? `Juste ! +${resultat?.points ?? 10} points` : `Raté. La bonne réponse : ${question.choix[question.bonne]}`}</b>
          {#if reponse === question.bonne && resultat}<span> · {ELEMENTS[resultat.famille]} avance.</span>{/if}
          {#if question.explication}<p>{question.explication}</p>{/if}
        </div>
        <div class="ligne">
          <button onclick={() => ui.ouvrirCarte(question.carteId)}>Lire la carte</button>
          <button class="encre" onclick={suivante}>{courante === -1 ? 'Voir le bilan' : 'Question suivante'}</button>
        </div>
      {/if}
    {/if}
  </section>

  {#if quartier.nomChat && !renommer}
    <div><button class="lien" onclick={() => { nom = quartier.nomChat; renommer = true }}>Renommer {quartier.nomChat}</button></div>
  {/if}

  <section class="pile serree">
    <h2>Ce qui se construit</h2>
    <p class="discret petit">Chaque bonne réponse fait avancer l'élément de la famille de la carte : esquissé, construit, puis animé.</p>
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
