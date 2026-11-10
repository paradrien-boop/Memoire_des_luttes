<script lang="ts">
  import { miseAJour } from '../etat/mise-a-jour.svelte'
</script>

{#if miseAJour.disponible}
  <div class="bandeau" role="status">
    <span>Une nouvelle version de l'app est prête.</span>
    <button class="rouge" onclick={() => miseAJour.redemarrer()}>Redémarrer</button>
  </div>
{/if}

<style>
  .bandeau {
    position: fixed; left: 0; right: 0; top: 0; z-index: 30; background: var(--encre); color: var(--papier);
    display: flex; gap: 12px; align-items: center; justify-content: space-between; font-weight: 700;
    padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px));
  }
  button { flex: none; padding: 6px 12px; }
</style>
