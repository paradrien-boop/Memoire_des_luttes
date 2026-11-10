<script lang="ts">
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  let texte = $state('')

  async function importer(t: string) {
    try { ui.annoncer(await jeu.importer(t)); texte = '' }
    catch (err) { ui.annoncer((err as Error).message) }
  }
</script>

<textarea id="import-texte" class="code" bind:value={texte} placeholder={'{"format":"memoire-des-luttes/pack", …}'} aria-label="Texte du pack"></textarea>
<div class="ligne">
  <button class="encre" disabled={!texte.trim()} onclick={() => importer(texte)}>Importer le texte</button>
  <label class="bouton fichier">Choisir un fichier
    <input id="import-fichier" type="file" accept=".json,application/json,text/plain" hidden onchange={async (e) => { const f = e.currentTarget.files?.[0]; if (f) importer(await f.text()); e.currentTarget.value = '' }} />
  </label>
</div>

<style>
  .code { font-family: ui-monospace, Menlo, monospace; font-size: 12px; min-height: 100px; }
  .fichier { flex-direction: row; font-size: 13px; }
</style>
