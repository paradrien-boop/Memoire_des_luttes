<script lang="ts">
  import type { Ecran } from '../navigation'
  let { actif }: { actif: Ecran } = $props()
  const onglets: { id: Ecran; libelle: string; icone: string }[] = [
    { id: 'manif', libelle: 'Manif', icone: '✊' },
    { id: 'album', libelle: 'Album', icone: '▦' },
    { id: 'editeur', libelle: 'Éditeur', icone: '✎' },
    { id: 'plus', libelle: 'Plus', icone: '…' },
  ]
</script>

<nav aria-label="Navigation principale">
  {#each onglets as o (o.id)}
    <a href={'#' + o.id} aria-current={actif === o.id ? 'page' : undefined}><span class="icone" aria-hidden="true">{o.icone}</span>{o.libelle}</a>
  {/each}
</nav>

<style>
  nav {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--encre);
    padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
  }
  a { color: var(--papier); text-decoration: none; text-align: center; padding: 12px 4px 13px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .icone { display: block; font-family: var(--f-affiche); font-size: 22px; line-height: 1; margin-bottom: 3px; }
  a[aria-current='page'] { background: var(--rouge); color: var(--sur-rouge); }
</style>
