<script lang="ts">
  // Un bouton qui demande une confirmation en deux temps (les fenêtres de confirmation du navigateur sont évitées).
  let { libelle, confirmation, action, classe = '' }: { libelle: string; confirmation: string; action: () => void; classe?: string } = $props()
  let arme = $state(false)
</script>

{#if arme}
  <button class="rouge" onclick={() => { arme = false; action() }}>{confirmation}</button>
  <button onclick={() => (arme = false)}>Annuler</button>
{:else}
  <button class={classe} onclick={() => (arme = true)}>{libelle}</button>
{/if}
