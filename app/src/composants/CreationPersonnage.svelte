<script lang="ts">
  // Créer son personnage une fois, puis l'enregistrer tel quel. On peut le modifier ensuite, ici seulement.
  import Personnage from '../dessins/Personnage.svelte'
  import { TEINTS } from '../dessins/palette'
  import { profil } from '../etat/profil.svelte'
  import { quartier } from '../etat/quartier.svelte'
  import { ui } from '../etat/interface.svelte'

  const COIFFURES = ['Courte', 'Longue', 'Frisée']
  let edition = $state(!profil.personnage)
  let brouillon = $state({ nom: profil.personnage?.nom ?? '', teint: profil.personnage?.teint ?? quartier.apparence.teint, coiffure: profil.personnage?.coiffure ?? quartier.apparence.coiffure })

  async function enregistrer(e: SubmitEvent) {
    e.preventDefault()
    if (!brouillon.nom.trim()) { ui.annoncer('Donne un nom à ton personnage.'); return }
    await profil.enregistrerPersonnage(brouillon)
    edition = false
    ui.annoncer('Personnage enregistré.')
  }
</script>

<div class="perso">
  <svg viewBox="-60 -150 120 156" role="img" aria-label="Aperçu de ton personnage">
    <Personnage teint={edition ? brouillon.teint : profil.personnage!.teint} coiffure={edition ? brouillon.coiffure : profil.personnage!.coiffure} equipe={quartier.equipe} />
  </svg>

  {#if edition}
    <form class="pile serree reglages" onsubmit={enregistrer}>
      <label>Son nom<input id="perso-nom" bind:value={brouillon.nom} maxlength="30" autocomplete="off" placeholder="Ex. : Louise, Varlin, Camille…" /></label>
      <div class="groupe" role="radiogroup" aria-label="Teint">
        <span class="etiquette">Teint</span>
        {#each TEINTS as couleur, i (couleur)}
          <button type="button" class="pastille" class:choisi={brouillon.teint === i} style="background:{couleur}" role="radio" aria-checked={brouillon.teint === i} aria-label="Teint {i + 1}" onclick={() => (brouillon.teint = i)}></button>
        {/each}
      </div>
      <div class="groupe" role="radiogroup" aria-label="Coiffure">
        <span class="etiquette">Coiffure</span>
        {#each COIFFURES as c, i (c)}
          <button type="button" class="option" class:choisi={brouillon.coiffure === i} role="radio" aria-checked={brouillon.coiffure === i} onclick={() => (brouillon.coiffure = i)}>{c}</button>
        {/each}
      </div>
      <div class="ligne">
        <button class="rouge">Enregistrer mon personnage</button>
        {#if profil.personnage}<button type="button" onclick={() => (edition = false)}>Annuler</button>{/if}
      </div>
    </form>
  {:else}
    <div class="pile serree reglages">
      <p class="nom">{profil.personnage!.nom}</p>
      <p class="discret petit">Ton personnage est enregistré. Ses objets s'ajoutent tout seuls quand tu collectionnes des cartes.</p>
      <div><button onclick={() => { brouillon = { ...profil.personnage! }; edition = true }}>Modifier mon personnage</button></div>
    </div>
  {/if}
</div>

<style>
  .perso { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  svg { width: 120px; height: auto; flex: none; background: var(--papier); border: 2px solid var(--encre); }
  .reglages { flex: 1; min-width: 200px; }
  .serree { gap: 10px; }
  .groupe { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .etiquette { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; width: 6.5em; }
  .pastille { width: 30px; height: 30px; border-radius: 50%; padding: 0; border: 2px solid var(--trait); }
  .option { padding: 5px 10px; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .choisi { border-color: var(--rouge); border-width: 3px; }
  .option.choisi { background: var(--encre); color: var(--papier); border-color: var(--encre); }
  .nom { font-family: var(--f-affiche); font-weight: 900; font-size: 30px; text-transform: uppercase; }
  .petit { font-size: 13px; }
</style>
