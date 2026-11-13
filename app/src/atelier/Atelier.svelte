<script lang="ts">
  // Atelier de dessin : l'illustratrice ou l'illustrateur dépose ses fichiers (ou ouvre son dossier de travail)
  // et voit aussitôt le rendu dans les vraies scènes de l'app. Rien n'est envoyé : tout reste dans le navigateur.
  import { ELEMENTS, EMPLACEMENTS, OBJETS, type Emplacement, type Equipe } from '@mdl/noyau'
  import fichiersDuDepot from 'virtual:mdl-dessins'
  import { nomsPossibles } from '../../../scripts/dessins-noms.mjs'
  import Scene from '../dessins/Scene.svelte'
  import Personnage from '../dessins/Personnage.svelte'
  import Ennemi from '../dessins/Ennemi.svelte'
  import Chat from '../dessins/Chat.svelte'
  import { CADRES, essais } from '../dessins/fichiers.svelte'
  import { P, TEINTS } from '../dessins/palette'
  import { arreterSuivi, journal, lireDepot, lireFichiers, suivi, suiviPossible, suivreDossier, toutRetirer } from './chargement.svelte'

  const ONGLETS = [
    { id: 'quartier', nom: 'Quartier' },
    { id: 'personnage', nom: 'Personnage' },
    { id: 'bataille', nom: 'Bataille' },
    { id: 'chat', nom: 'Chat' },
    { id: 'liste', nom: 'Dessins attendus' },
  ] as const
  let onglet = $state<(typeof ONGLETS)[number]['id']>('quartier')

  const COIFFURES = ['Courte', 'Longue', 'Frisée']
  const DESSINS_ENNEMIS = ['soldat', 'proprietaire', 'patron', 'censeur', 'mouchard', 'general']
  const NOMS_ENNEMIS: Record<string, string> = { soldat: 'Soldat', proprietaire: 'Propriétaire', patron: 'Patron', censeur: 'Censeur', mouchard: 'Mouchard', general: 'Général' }
  const NOMS_STADES = ['Chaton des rues', 'Chat de gouttière', 'Chat de grève', 'Chat de barricade', 'Chat sauvage']

  // Le personnage essayé, partagé par tous les onglets.
  let teint = $state(1)
  let coiffure = $state(0)
  let equipe = $state<Equipe>({})
  const objetsDe = (e: Emplacement) => OBJETS.filter((o) => o.emplacement === e)
  function toutEquiper() {
    equipe = Object.fromEntries(EMPLACEMENTS.map((e) => [e.id, objetsDe(e.id)[0]?.id ?? null]))
  }

  // Quartier
  let niveau = $state(2)
  let stade = $state(2)
  let dort = $state(false)
  let nuit = $state(false)
  let foule = $state(3)
  let pancarte = $state(false)
  let avecPersonnage = $state(true)
  let accessoires = $state<string[]>([])
  const niveaux = $derived(Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, niveau])))

  // Bataille
  let adversaire = $state('soldat')
  let issue = $state<'attente' | 'victoire' | 'defaite'>('attente')

  let survol = $state(false)
  const vb = (c: { x: number; y: number; l: number; h: number }) => `${c.x} ${c.y} ${c.l} ${c.h}`
  const nbEssais = $derived(Object.keys(essais.fichiers).length)

  // Dessins attendus, rangés par dossier.
  const GROUPES = [
    { titre: 'Personnage (corps)', prefixe: 'personnage/base' },
    { titre: 'Objets du personnage', prefixe: 'personnage/objets/' },
    { titre: 'Adversaires', prefixe: 'ennemis/' },
    { titre: 'Chat', prefixe: 'chat/' },
    { titre: 'Quartier', prefixe: 'quartier/' },
  ]
  const NOMS = nomsPossibles()
</script>

<svelte:window ondragover={(e) => { e.preventDefault(); survol = true }} ondragleave={(e) => { if (!e.relatedTarget) survol = false }}
  ondrop={(e) => { e.preventDefault(); survol = false; if (e.dataTransfer) lireDepot(e.dataTransfer) }} />

<main class="atelier pile">
  <header>
    <div class="surtitre">Mémoire des luttes</div>
    <h1>Atelier de dessin</h1>
    <p class="intro">Dépose tes dessins : ils apparaissent tout de suite dans les vraies scènes de l'app. <b>Rien n'est envoyé</b>, tes fichiers restent sur ton ordinateur. Les gabarits, les règles et les noms de fichiers sont expliqués dans <code>data/dessins/README.md</code>.</p>
  </header>

  <section class="encart" class:survol aria-labelledby="titre-fichiers">
    <h2 id="titre-fichiers">Tes dessins</h2>
    <div class="ligne">
      {#if suiviPossible}
        {#if suivi.dossier}
          <span class="suivi">● Dossier « {suivi.dossier} » suivi : chaque enregistrement s'affiche ici.</span>
          <button type="button" onclick={arreterSuivi}>Arrêter le suivi</button>
        {:else}
          <button type="button" class="rouge" onclick={suivreDossier}>Ouvrir mon dossier de travail</button>
        {/if}
      {/if}
      <label class="bouton fichier">Choisir des fichiers
        <input type="file" accept=".svg,.png,image/svg+xml,image/png" multiple onchange={(e) => { lireFichiers([...(e.currentTarget.files ?? [])]); e.currentTarget.value = '' }} />
      </label>
      {#if nbEssais}<button type="button" onclick={() => { arreterSuivi(); toutRetirer() }}>Tout retirer</button>{/if}
    </div>
    <p class="note">
      {#if suiviPossible}Avec « Ouvrir mon dossier de travail », la page relit tes fichiers dès que tu les enregistres dans ton logiciel de dessin.{:else}Pour que la page se mette à jour à chaque enregistrement, ouvre-la dans Chrome ou Edge. Ici, redépose le fichier après chaque modification.{/if}
      Tu peux aussi glisser des fichiers ou un dossier entier n'importe où dans la page.
    </p>
    <label class="case"><input type="checkbox" bind:checked={essais.ignorer} /> Comparer : afficher les dessins d'origine à la place des tiens</label>
    {#if journal.lignes.length}
      <ul class="journal" aria-live="polite">
        {#each journal.lignes as l (l.fichier)}
          <li class:refus={l.probleme}>
            <span class="fichier-nom">{l.fichier}</span>
            {#if l.probleme}<span>✗ {l.probleme}</span>{:else}<span>✓ remplace <b>{l.nom}</b></span>{/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="discret">Aucun dessin déposé pour l'instant : les scènes montrent les dessins actuels de l'app.</p>
    {/if}
  </section>

  <div class="onglets" role="tablist" aria-label="Scènes">
    {#each ONGLETS as o (o.id)}
      <button type="button" role="tab" aria-selected={onglet === o.id} class:actif={onglet === o.id} onclick={() => (onglet = o.id)}>{o.nom}</button>
    {/each}
  </div>

  {#snippet reglagesPersonnage()}
    <fieldset>
      <legend>Personnage</legend>
      <div class="ligne">
        <span class="etiquette">Teint</span>
        {#each TEINTS as t, i (t)}
          <button type="button" class="pastille" class:choisi={teint === i} style:background={t} aria-label="Teint {i + 1}" aria-pressed={teint === i} onclick={() => (teint = i)}></button>
        {/each}
        <button type="button" class="pastille" class:choisi={teint === -1} style:background="#FF00FF" aria-label="Couleur repère (magenta)" aria-pressed={teint === -1} onclick={() => (teint = -1)}></button>
      </div>
      <div class="ligne">
        <span class="etiquette">Coiffure</span>
        {#each COIFFURES as c, i (c)}
          <button type="button" class="petit" aria-pressed={coiffure === i} class:choisi={coiffure === i} onclick={() => (coiffure = i)}>{c}</button>
        {/each}
      </div>
      <div class="emplacements">
        {#each EMPLACEMENTS as e (e.id)}
          <label>{e.nom}
            <select value={equipe[e.id] ?? ''} onchange={(ev) => (equipe = { ...equipe, [e.id]: ev.currentTarget.value || null })}>
              <option value="">Rien</option>
              {#each objetsDe(e.id) as o (o.id)}<option value={o.id}>{o.nom}</option>{/each}
            </select>
          </label>
        {/each}
      </div>
      <div class="ligne">
        <button type="button" class="petit" onclick={toutEquiper}>Tout équiper</button>
        <button type="button" class="petit" onclick={() => (equipe = {})}>Tout enlever</button>
      </div>
    </fieldset>
  {/snippet}

  {#if onglet === 'quartier'}
    <section class="vue" aria-label="Quartier">
      <div class="rendu large">
        <Scene {niveaux} {stade} {dort} {accessoires} {pancarte} {foule} heure={nuit ? 22 : 12}
          personnage={avecPersonnage ? { teint, coiffure, equipe } : null}
          description="Aperçu du quartier dans l'atelier de dessin" />
      </div>
      <div class="reglages">
        <fieldset>
          <legend>Quartier</legend>
          <label>Niveau des éléments : {['rien', 'esquissé', 'construit', 'animé'][niveau]}
            <input type="range" min="0" max="3" bind:value={niveau} /></label>
          <label>Passants : {foule}<input type="range" min="0" max="6" bind:value={foule} /></label>
          <label class="case"><input type="checkbox" bind:checked={nuit} /> Nuit</label>
          <label class="case"><input type="checkbox" bind:checked={pancarte} /> Jour de manif (pancarte)</label>
          <label class="case"><input type="checkbox" bind:checked={avecPersonnage} /> Afficher le personnage</label>
        </fieldset>
        <fieldset>
          <legend>Chat</legend>
          <label>Stade : {NOMS_STADES[stade]}<input type="range" min="0" max="4" bind:value={stade} /></label>
          <label class="case"><input type="checkbox" bind:checked={dort} /> Endormi</label>
        </fieldset>
        {@render reglagesPersonnage()}
      </div>
    </section>
  {:else if onglet === 'personnage'}
    <section class="vue" aria-label="Personnage">
      <div class="rendu poses">
        {#each [['repos', 'Au repos'], ['victoire', 'Victoire'], ['sonne', 'Sonné']] as [pose, titre] (pose)}
          <figure>
            <svg viewBox={vb(CADRES.personnage)} role="img" aria-label="Personnage, {titre.toLowerCase()}">
              <rect x={CADRES.personnage.x} y={CADRES.personnage.y} width={CADRES.personnage.l} height={CADRES.personnage.h} fill={P.papier} />
              <Personnage {teint} {coiffure} {equipe} pose={pose as 'repos'} />
            </svg>
            <figcaption>{titre}</figcaption>
          </figure>
        {/each}
      </div>
      <div class="reglages">{@render reglagesPersonnage()}</div>
    </section>
  {:else if onglet === 'bataille'}
    <section class="vue" aria-label="Bataille">
      <div class="rendu large">
        <svg viewBox="0 0 400 230" role="img" aria-label="Bataille contre {NOMS_ENNEMIS[adversaire]}">
          <rect width="400" height="230" fill={P.papier} />
          <rect y="190" width="400" height="40" fill={P.pierre} />
          <g transform="translate(110,206) scale(1.15)">
            <Personnage {teint} {coiffure} {equipe} pose={issue === 'victoire' ? 'victoire' : issue === 'defaite' ? 'sonne' : 'repos'} />
          </g>
          <g transform="translate(295,206) scale(1.15)">
            <Ennemi dessin={adversaire} pose={issue === 'victoire' ? 'fuite' : 'menace'} />
          </g>
        </svg>
      </div>
      <div class="reglages">
        <fieldset>
          <legend>Adversaire</legend>
          <div class="ligne">
            {#each DESSINS_ENNEMIS as d (d)}
              <button type="button" class="petit" aria-pressed={adversaire === d} class:choisi={adversaire === d} onclick={() => (adversaire = d)}>{NOMS_ENNEMIS[d]}</button>
            {/each}
          </div>
          <div class="ligne">
            {#each [['attente', 'Face à face'], ['victoire', 'Victoire (il fuit)'], ['defaite', 'Défaite']] as [id, nom] (id)}
              <button type="button" class="petit" aria-pressed={issue === id} class:choisi={issue === id} onclick={() => (issue = id as 'attente')}>{nom}</button>
            {/each}
          </div>
        </fieldset>
        {@render reglagesPersonnage()}
      </div>
      <div class="rendu ennemis">
        {#each DESSINS_ENNEMIS as d (d)}
          {#each ['menace', 'fuite'] as pose (pose)}
            <figure>
              <svg viewBox={vb(CADRES.ennemis)} role="img" aria-label="{NOMS_ENNEMIS[d]}, {pose}"><Ennemi dessin={d} pose={pose as 'menace'} /></svg>
              <figcaption>{NOMS_ENNEMIS[d]}{pose === 'fuite' ? ' (fuite)' : ''}</figcaption>
            </figure>
          {/each}
        {/each}
      </div>
    </section>
  {:else if onglet === 'chat'}
    <section class="vue" aria-label="Chat">
      <div class="rendu chats">
        {#each NOMS_STADES as nom, s (nom)}
          <figure>
            <svg viewBox={vb(CADRES.chat)} role="img" aria-label={nom}>
              <rect x={CADRES.chat.x} y={CADRES.chat.y} width={CADRES.chat.l} height={CADRES.chat.h} fill={P.papier} />
              <Chat stade={s} {dort} {accessoires} {pancarte} />
            </svg>
            <figcaption>{s + 1}. {nom}</figcaption>
          </figure>
        {/each}
      </div>
      <div class="reglages">
        <fieldset>
          <legend>Chat</legend>
          <label class="case"><input type="checkbox" bind:checked={dort} /> Endormi</label>
          <label class="case"><input type="checkbox" bind:checked={pancarte} /> Pancarte (jour de manif)</label>
          {#each [['cocarde', 'Cocarde'], ['foulard', 'Foulard'], ['partition', 'Partition']] as [id, nom] (id)}
            <label class="case"><input type="checkbox" checked={accessoires.includes(id)}
              onchange={(e) => (accessoires = e.currentTarget.checked ? [...accessoires, id] : accessoires.filter((x) => x !== id))} /> {nom}</label>
          {/each}
        </fieldset>
      </div>
    </section>
  {:else}
    <section class="vue liste" aria-label="Dessins attendus">
      <p class="note">Chaque nom correspond à un fichier : par exemple <code>ennemis/censeur.svg</code> ou simplement <code>censeur.svg</code>. ✓ : tu l'as déposé ici. ● : un dessin déposé dans le dépôt est déjà dans l'app. Sinon, l'app utilise le dessin en code.</p>
      {#each GROUPES as g (g.titre)}
        <h3>{g.titre}</h3>
        <ul>
          {#each NOMS.filter((n) => n.startsWith(g.prefixe)) as n (n)}
            <li class:depose={essais.fichiers[n]}>
              <span aria-hidden="true">{essais.fichiers[n] ? '✓' : fichiersDuDepot[n] ? '●' : '·'}</span>
              <code>{n}</code>
              {#if essais.fichiers[n]}<span class="sr">déposé</span>{:else if fichiersDuDepot[n]}<span class="sr">déjà dans l'app</span>{/if}
            </li>
          {/each}
        </ul>
      {/each}
    </section>
  {/if}
</main>

<style>
  .atelier { max-width: 1100px; margin: 0 auto; padding: 24px 16px 60px; }
  .intro { font-family: var(--f-texte); max-width: 70ch; margin-top: 8px; }
  code { font-size: .9em; background: var(--carte); padding: 0 4px; }
  .survol { outline: 3px dashed var(--rouge); outline-offset: 4px; }
  .fichier { position: relative; display: inline-block; flex-direction: row; }
  .fichier input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .suivi { color: var(--rouge); font-weight: 700; }
  .case { flex-direction: row; align-items: center; gap: 8px; font-weight: 400; }
  .case input { width: auto; }
  .journal { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow: auto; font-size: 13px; }
  .journal li { display: flex; gap: 10px; flex-wrap: wrap; border-left: 3px solid var(--encre); padding-left: 8px; }
  .journal li.refus { border-color: var(--rouge); color: var(--rouge); }
  .fichier-nom { font-family: ui-monospace, monospace; overflow-wrap: anywhere; }
  .onglets { display: flex; gap: 6px; flex-wrap: wrap; border-bottom: 2px solid var(--encre); }
  .onglets button { border-bottom: none; }
  .onglets .actif { background: var(--encre); color: var(--papier); }
  .vue { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 18px; align-items: start; }
  .vue.liste { display: block; }
  .rendu { border: 2px solid var(--encre); background: #EDE8E0; }
  .rendu svg, .rendu :global(svg) { display: block; width: 100%; height: auto; }
  .poses, .chats, .ennemis { display: grid; gap: 8px; padding: 8px; }
  .poses { grid-template-columns: repeat(3, 1fr); }
  .chats { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
  .ennemis { grid-column: 1 / -1; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
  figure { margin: 0; }
  figcaption { text-align: center; font-size: 12px; color: #1C1816; }
  .reglages { display: flex; flex-direction: column; gap: 12px; }
  fieldset { border: 2px solid var(--encre); background: var(--carte); padding: 12px; display: flex; flex-direction: column; gap: 10px; margin: 0; }
  legend { font-family: var(--f-affiche); text-transform: uppercase; font-weight: 900; font-size: 18px; padding: 0 6px; }
  .etiquette { font-size: 13px; font-weight: 700; min-width: 70px; }
  .pastille { width: 30px; height: 30px; padding: 0; border-radius: 50%; }
  .pastille.choisi { outline: 3px solid var(--rouge); outline-offset: 2px; }
  .petit { padding: 6px 10px; font-size: 12px; }
  .petit.choisi { background: var(--encre); color: var(--papier); }
  .emplacements { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .liste h3 { margin: 18px 0 6px; font-size: 20px; }
  .liste ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2px 14px; font-size: 13px; }
  .liste li { display: flex; gap: 8px; }
  .liste li.depose { color: var(--rouge); font-weight: 700; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  @media (max-width: 760px) {
    .vue { grid-template-columns: minmax(0, 1fr); }
    .emplacements { grid-template-columns: 1fr; }
  }
</style>
