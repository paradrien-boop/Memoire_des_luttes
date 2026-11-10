<script lang="ts">
  import type { Carte } from '@mdl/noyau'
  import Entete from '../composants/Entete.svelte'
  import CarteGrande from '../composants/Carte.svelte'
  import BoutonConfirme from '../composants/BoutonConfirme.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { catalogue } from '../donnees'
  import { RARETES } from '../libelles'
  import { reduireImage } from '../outils'

  const VIDE: Carte = { id: '', fam: 'evenement', rar: 'base', title: '', links: [] }
  const familles = Object.entries(catalogue.familles)

  function depart(): Carte {
    if (ui.aModifier) {
      const c = jeu.perso.find((x) => x.id === ui.aModifier)
      ui.aModifier = null
      if (c) return structuredClone($state.snapshot(c)) as Carte
    }
    return jeu.brouillon ? (structuredClone($state.snapshot(jeu.brouillon)) as Carte) : { ...VIDE }
  }

  let carte = $state<Carte>(depart())
  let nomPack = $state('')
  let packTexte = $state('')
  let importTexte = $state('')
  const champs = $derived(catalogue.familles[carte.fam].champs)
  const champTitre = $derived(champs.find((c) => c.role === 'title')!)
  const autres = $derived(champs.filter((c) => c.role !== 'title'))

  const valeur = (cle: string) => (typeof carte[cle] === 'string' ? (carte[cle] as string) : '')
  function changer(cle: string, v: string) {
    carte[cle] = v
    jeu.sauverBrouillon(carte)
  }

  async function choisirImage(e: Event) {
    const fichier = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!fichier) return
    try { changer('img', await reduireImage(fichier)) } catch (err) { ui.annoncer((err as Error).message) }
  }

  async function enregistrer(e: SubmitEvent) {
    e.preventDefault()
    const manque = champs.find((c) => c.obligatoire && !valeur(c.cle).trim())
    if (manque) { ui.annoncer(`Il manque : ${manque.libelle}.`); document.getElementById('e-' + manque.cle)?.focus(); return }
    const nouvelle = !carte.id
    const aEnregistrer = $state.snapshot(carte) as Carte
    // Le formulaire se vide tout de suite : ce qu'on tape ensuite est un nouveau brouillon.
    carte = { ...VIDE }
    await jeu.sauverBrouillon(null)
    await jeu.enregistrerPerso(aEnregistrer)
    ui.annoncer(nouvelle ? 'Carte ajoutée à ton album.' : 'Carte modifiée.')
  }

  function nouvelleCarte() { carte = { ...VIDE }; jeu.sauverBrouillon(null) }
  function modifier(c: Carte) { carte = structuredClone($state.snapshot(c)) as Carte; scrollTo(0, 0) }

  async function copier() {
    try { await navigator.clipboard.writeText(packTexte); ui.annoncer('Pack copié.') }
    catch { (document.getElementById('pack-texte') as HTMLTextAreaElement)?.select(); ui.annoncer('Texte sélectionné : copie-le à la main.') }
  }

  async function importer(texte: string) {
    try { const n = await jeu.importer(texte); importTexte = ''; ui.annoncer(`${n} carte(s) importée(s). Elles sont dans l'album.`) }
    catch (err) { ui.annoncer((err as Error).message) }
  }
</script>

<Entete surtitre="Fais tes propres cartes" titre="Éditeur" marque={'Hors ligne\net anonyme'} />

<div class="editeur">
  <form class="pile" onsubmit={enregistrer} autocomplete="off">
    <div class="deux">
      <label>Famille
        <select id="e-fam" value={carte.fam} onchange={(e) => changer('fam', e.currentTarget.value)}>
          {#each familles as [cle, f] (cle)}
            <option value={cle} disabled={f.reserveeAuCollectif}>{f.libelle}{f.reserveeAuCollectif ? ' (réservée au collectif)' : ''}</option>
          {/each}
        </select>
      </label>
      <label>Rareté proposée
        <select id="e-rar" value={carte.rar} onchange={(e) => changer('rar', e.currentTarget.value)}>
          {#each ['base', 'rare', 'legendaire'] as r (r)}<option value={r}>{RARETES[r]}</option>{/each}
        </select>
      </label>
    </div>
    <p class="note">Les rubriques changent selon la famille. Ce que tu as déjà écrit est gardé si tu changes d'avis.</p>

    <label>{champTitre.libelle} *
      <input id="e-title" value={carte.title} placeholder={champTitre.exemple ?? ''} oninput={(e) => changer('title', e.currentTarget.value)} />
    </label>
    {#each autres as c (c.cle)}
      <label>
        <span>{c.libelle}{c.obligatoire ? ' *' : ''} {#if c.aide}<small>{c.aide}</small>{/if}</span>
        {#if c.long}
          <textarea id={'e-' + c.cle} maxlength={c.max} placeholder={c.exemple ?? ''} value={valeur(c.cle)} oninput={(e) => changer(c.cle, e.currentTarget.value)}></textarea>
        {:else}
          <input id={'e-' + c.cle} maxlength={c.max} placeholder={c.exemple ?? ''} value={valeur(c.cle)} oninput={(e) => changer(c.cle, e.currentTarget.value)} />
        {/if}
      </label>
    {/each}
    <label>
      <span>Sources <small>Obligatoire pour proposer la carte au pack officiel.</small></span>
      <input id="e-src" value={valeur('src')} placeholder="Ex. : Wikipédia, Le Maitron…" oninput={(e) => changer('src', e.currentTarget.value)} />
    </label>
    <label>
      <span>Image <small>Elle est réduite et passée en noir et blanc. Elle reste dans le téléphone.</small></span>
      <input id="e-img" type="file" accept="image/*" onchange={choisirImage} />
    </label>
    {#if carte.img}<div><button type="button" onclick={() => changer('img', '')}>Retirer l'image</button></div>{/if}
    <div class="ligne">
      <button class="rouge">{carte.id ? 'Enregistrer les changements' : 'Enregistrer la carte'}</button>
      <button type="button" onclick={nouvelleCarte}>Nouvelle carte</button>
    </div>
  </form>

  <div class="apercu pile">
    <div class="surtitre">Aperçu</div>
    <CarteGrande carte={{ ...carte, origine: 'perso' }} />
  </div>
</div>

<div class="pile suite">
  <section class="pile">
    <div class="tete"><h2>Mes cartes</h2><span class="compte">{jeu.perso.length}</span></div>
    {#if jeu.perso.length}
      <div class="liste">
        {#each jeu.perso as c (c.id)}
          <div class="element">
            <b>{c.title}</b>
            <div class="ligne actions">
              <button onclick={() => modifier(c)}>Modifier</button>
              <BoutonConfirme libelle="Supprimer" confirmation="Confirmer" action={() => { jeu.supprimerPerso(c.id); ui.annoncer('Carte supprimée.') }} />
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="discret">Tu n'as pas encore fait de carte. Remplis le formulaire : l'aperçu se met à jour pendant que tu écris.</p>
    {/if}
  </section>

  <section class="encart">
    <div><div class="surtitre">Partager</div><h2>Exporter un pack</h2></div>
    <p class="petit">Regroupe tes cartes dans un pack, puis copie le texte pour le passer à un·e camarade. À l'étape 5, il pourra aussi passer de téléphone à téléphone par QR code.</p>
    <label>Nom du pack<input id="pack-nom" bind:value={nomPack} placeholder="Ex. : Grèves de ma ville" /></label>
    <div class="ligne">
      <button class="encre" disabled={!jeu.perso.length} onclick={() => (packTexte = jeu.exporter(nomPack))}>Générer le pack</button>
      {#if packTexte}<button onclick={copier}>Copier</button>{/if}
    </div>
    {#if packTexte}<textarea id="pack-texte" class="code" readonly value={packTexte}></textarea>{/if}
  </section>

  <section class="encart">
    <div><div class="surtitre">Recevoir</div><h2>Importer un pack</h2></div>
    <p class="petit">Colle le texte d'un pack ou choisis son fichier. Un pack non signé reste dans ton album mais ne tombe jamais dans les boosters.</p>
    <textarea id="import-texte" class="code" bind:value={importTexte} placeholder={'{"format":"memoire-des-luttes/pack", …}'}></textarea>
    <div class="ligne">
      <button class="encre" disabled={!importTexte.trim()} onclick={() => importer(importTexte)}>Importer le texte</button>
      <label class="bouton fichier">Choisir un fichier
        <input id="import-fichier" type="file" accept=".json,application/json,text/plain" hidden onchange={async (e) => { const f = e.currentTarget.files?.[0]; if (f) importer(await f.text()) }} />
      </label>
    </div>
  </section>
</div>

<style>
  .editeur { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start; }
  .apercu { position: sticky; top: calc(12px + env(safe-area-inset-top, 0px)); }
  @media (max-width: 700px) { .editeur { grid-template-columns: minmax(0, 1fr); } .apercu { position: static; order: -1; } }
  .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  label > span { display: flex; flex-direction: column; gap: 2px; }
  .suite { margin-top: 30px; }
  .tete { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid var(--encre); padding-bottom: 6px; }
  .compte { font-family: var(--f-affiche); font-weight: 900; font-size: 22px; color: var(--rouge); }
  .liste { display: flex; flex-direction: column; gap: 8px; }
  .element { display: flex; justify-content: space-between; align-items: center; gap: 8px; border: 1.5px solid var(--trait); padding: 8px 10px; background: var(--carte); flex-wrap: wrap; }
  .element b { font-family: var(--f-affiche); text-transform: uppercase; font-size: 18px; min-width: 0; overflow-wrap: anywhere; }
  .actions :global(button) { padding: 5px 9px; font-size: 11px; }
  .petit { font-size: 14px; }
  .code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; min-height: 120px; }
  .fichier { flex-direction: row; font-size: 13px; }
</style>
