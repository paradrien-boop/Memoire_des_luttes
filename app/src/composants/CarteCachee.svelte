<script lang="ts">
  import { RARETES } from '../libelles'
  let { numero, rarete }: { numero: number; rarete: string } = $props()
</script>

<div class="cachee" aria-label="Carte pas encore trouvée">
  <div class="visuel" aria-hidden="true">?</div>
  <div class="titre">N° {numero}</div>
  <div class="famille">{RARETES[rarete]}</div>
</div>

<style>
  .cachee { aspect-ratio: 5 / 7; border: 2px dashed var(--trait); display: flex; flex-direction: column; }
  .visuel { flex: 1; display: grid; place-items: center; font-family: var(--f-affiche); font-weight: 900; font-size: 46px; color: var(--trait); }
  .titre { font-family: var(--f-affiche); font-weight: 900; font-size: 15px; padding: 6px 6px 2px; color: var(--discret); }
  .famille { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--discret); padding: 0 6px 6px; font-weight: 700; }
</style>
