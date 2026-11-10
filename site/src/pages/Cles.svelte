<script lang="ts">
  import site from 'virtual:mdl-site'
  import { empreinte, genererCles, type Cles } from '@mdl/noyau'

  let cles = $state<Cles | null>(null)
  let telechargee = $state(false)
  let id = $state('')
  let nom = $state('')
  let presentation = $state('')
  let themes = $state('')
  let annuaire = $state(true)
  let copie = $state(false)
  let lienCle = $state('')

  const reconnus = site.collectifs.filter((c) => c.valide)
  const idValide = $derived(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(id))
  const demande = $derived(cles ? JSON.stringify({
    type: 'demande-de-reconnaissance', id, nom: nom.trim(), presentation: presentation.trim(),
    themes: themes.split(',').map((t) => t.trim()).filter(Boolean), annuaire, clePublique: cles.publique, empreinte: empreinte(cles.publique),
  }, null, 2) : '')

  function generer() {
    cles = genererCles()
    telechargee = false
    const fichier = new Blob([JSON.stringify({ avertissement: 'CLÉ SECRÈTE DU COLLECTIF. Ne jamais la partager, ni la mettre en ligne. Qui la possède peut signer à votre nom.', collectif: id || null, ...cles }, null, 2)], { type: 'application/json' })
    if (lienCle) URL.revokeObjectURL(lienCle)
    lienCle = URL.createObjectURL(fichier)
  }

  async function copier() {
    try { await navigator.clipboard.writeText(demande); copie = true }
    catch { (document.getElementById('demande') as HTMLTextAreaElement)?.select() }
  }
</script>

<div class="pile">
  <div><div class="surtitre">Signatures et confiance</div><h1>Clés</h1></div>
  <p class="intro">Les cartes officielles et les QR des stands sont signés. Chaque téléphone vérifie les signatures tout seul, sans réseau : un pack modifié d'une seule lettre est refusé.</p>

  <section class="encart">
    <h2>La clé du collectif</h2>
    {#if site.cles.empreintes.length}
      <p>L'empreinte affichée dans l'app (Plus › Packs) doit être exactement :</p>
      {#each site.cles.empreintes as e (e)}<p class="empreinte">{e}</p>{/each}
    {:else}
      <p class="note">Le collectif n'a pas encore publié sa clé.</p>
    {/if}
    {#if site.cles.revocations}<p class="discret">{site.cles.revocations} clé(s) révoquée(s). Les apps les refusent dès qu'elles reçoivent le pack officiel qui les annonce.</p>{/if}
  </section>

  <section class="encart">
    <h2>Collectifs reconnus</h2>
    {#if reconnus.length}
      <ul>{#each reconnus as c (c.id)}<li><b>{c.nom}</b> · <code>{c.empreinte}</code> · jusqu'au {c.expire}</li>{/each}</ul>
    {:else}
      <p class="discret">Aucun pour l'instant.</p>
    {/if}
  </section>

  <section class="encart" id="creer">
    <h2>Créer la clé de ton collectif</h2>
    <p class="note">La clé est créée dans cette page, sur ton ordinateur : <b>rien n'est envoyé</b>. Le mieux est d'ouvrir cette page, puis de couper Internet avant de créer la clé. Garde la clé secrète sur une clé USB, hors ligne, à deux personnes au plus.</p>
    <div class="deux">
      <label>Identifiant court <small>Lettres minuscules, chiffres et tirets, par ex. « cgt-douarnenez »</small><input id="c-id" bind:value={id} autocomplete="off" /></label>
      <label>Nom affiché<input id="c-nom" bind:value={nom} autocomplete="off" /></label>
    </div>
    <label>Présentation <small>Deux ou trois phrases</small><textarea id="c-presentation" bind:value={presentation}></textarea></label>
    <label>Thèmes <small>Séparés par des virgules</small><input id="c-themes" bind:value={themes} autocomplete="off" /></label>
    <label class="case"><input type="checkbox" bind:checked={annuaire} /> Apparaître dans l'annuaire public</label>
    <div><button class="rouge" disabled={!idValide || !nom.trim()} onclick={generer}>{cles ? 'Recréer une clé' : 'Créer la clé'}</button></div>
    {#if !idValide && id}<p class="erreur">L'identifiant doit faire de 3 à 40 caractères : lettres minuscules, chiffres et tirets.</p>{/if}

    {#if cles}
      <div class="resultat pile">
        <p>Empreinte de votre clé : <span class="empreinte">{empreinte(cles.publique)}</span></p>
        <div class="etape">
          <h3>1. Garder la clé secrète</h3>
          <p>Télécharge-la maintenant et range-la hors ligne. Elle ne sera plus affichée ensuite.</p>
          <a class="bouton rouge" href={lienCle} download={`${id}.cle-secrete.json`} onclick={() => (telechargee = true)}>Télécharger la clé secrète</a>
        </div>
        <div class="etape" class:attente={!telechargee}>
          <h3>2. Envoyer la demande de reconnaissance</h3>
          <p>Elle ne contient que la clé publique. Envoie-la au collectif{site.config.lienDebat ? '' : ' par le moyen convenu avec lui'}.</p>
          <textarea id="demande" class="code" readonly value={demande}></textarea>
          <div><button onclick={copier}>{copie ? 'Copiée ✓' : 'Copier la demande'}</button></div>
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
  h1 { font-size: 56px; }
  .intro { font-family: var(--f-texte); font-size: 17px; max-width: 65ch; line-height: 1.5; }
  .empreinte { font-family: ui-monospace, Menlo, monospace; font-size: 20px; font-weight: 700; letter-spacing: .05em; }
  .deux { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  @media (max-width: 600px) { .deux { grid-template-columns: minmax(0, 1fr); } }
  .case { flex-direction: row; align-items: center; gap: 8px; font-weight: 500; }
  .case input { width: auto; }
  ul { margin: 0; padding-left: 18px; }
  code { font-family: ui-monospace, Menlo, monospace; }
  .code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; min-height: 180px; }
  .resultat { border-top: 2px solid var(--encre); padding-top: 12px; }
  .etape { display: flex; flex-direction: column; gap: 8px; }
  .etape.attente { opacity: .55; }
  h3 { font-size: 20px; }
  .bouton { text-decoration: none; display: inline-block; align-self: flex-start; }
  a.bouton.rouge { background: var(--rouge); border-color: var(--rouge); color: var(--sur-rouge); }
  .erreur { color: var(--rouge); font-size: 13px; }
</style>
