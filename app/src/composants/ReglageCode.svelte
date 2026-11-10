<script lang="ts">
  import { verrou } from '../etat/verrou.svelte'
  import { ui } from '../etat/interface.svelte'
  let code1 = $state('')
  let code2 = $state('')

  async function activer(e: SubmitEvent) {
    e.preventDefault()
    if (!/^\d{4,8}$/.test(code1)) { ui.annoncer('Le code doit avoir de 4 à 8 chiffres.'); return }
    if (code1 !== code2) { ui.annoncer('Les deux codes sont différents.'); return }
    await verrou.definir(code1)
    code1 = code2 = ''
    ui.annoncer("Code d'ouverture activé.")
  }
</script>

<p>Avec un code, l'app s'ouvre sur un écran neutre et gris, qui ne dit pas de quelle app il s'agit. Elle se reverrouille quand tu la quittes plus d'une minute.</p>
<p class="note">Le code protège d'un coup d'œil, pas d'un examen technique du téléphone. En cas de risque sérieux, utilise « Tout effacer ». Si tu oublies ton code, il faudra effacer les données de l'app depuis les réglages du navigateur.</p>
{#if verrou.actif}
  <p><b>✓ Le code d'ouverture est activé.</b></p>
  <div class="ligne">
    <button class="encre" onclick={() => verrou.verrouiller()}>Verrouiller maintenant</button>
    <button onclick={async () => { await verrou.retirer(); ui.annoncer("Code d'ouverture retiré.") }}>Retirer le code</button>
  </div>
{:else}
  <form class="pile" onsubmit={activer}>
    <div class="deux">
      <label>Code (4 à 8 chiffres)<input id="code-1" type="password" inputmode="numeric" autocomplete="off" maxlength="8" bind:value={code1} /></label>
      <label>Le même, encore<input id="code-2" type="password" inputmode="numeric" autocomplete="off" maxlength="8" bind:value={code2} /></label>
    </div>
    <div><button class="rouge">Activer le code</button></div>
  </form>
{/if}

<style>
  .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
</style>
