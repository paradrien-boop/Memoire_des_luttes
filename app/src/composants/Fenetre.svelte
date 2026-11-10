<script lang="ts">
  import type { Snippet } from 'svelte'
  let { titre, fermer, children }: { titre: string; fermer: () => void; children: Snippet } = $props()
  let boite: HTMLDivElement

  $effect(() => {
    const avant = document.activeElement as HTMLElement | null
    boite.focus()
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') fermer() }
    addEventListener('keydown', touche)
    document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', touche); document.body.style.overflow = ''; avant?.focus?.() }
  })
</script>

<div class="fond" role="dialog" aria-modal="true" aria-label={titre} tabindex="-1" bind:this={boite}>
  <div class="contenu">{@render children()}</div>
</div>

<style>
  .fond {
    position: fixed; inset: 0; z-index: 40; background: var(--papier); overflow-y: auto; outline: none;
    padding: calc(20px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) calc(30px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  }
  .contenu { max-width: 420px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; align-items: center; }
</style>
