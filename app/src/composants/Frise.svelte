<script lang="ts">
  // Frise chronologique d'une série complète : ses cartes dans l'ordre des dates.
  import { annee } from '@mdl/noyau'
  import { catalogue } from '../donnees'
  import { ui } from '../etat/interface.svelte'

  let { serieId }: { serieId: string } = $props()
  const serie = $derived(catalogue.series.find((s) => s.id === serieId)!)
  const cartes = $derived(
    serie.cartes.map((id) => catalogue.parId[id]).filter(Boolean)
      .map((c) => ({ c, a: annee(c) }))
      .sort((x, y) => (x.a ?? 99999) - (y.a ?? 99999) || String(x.c.dates ?? '').localeCompare(String(y.c.dates ?? ''))),
  )
</script>

<div class="surtitre">Série complète · frise chronologique</div>
<h2 class="centre">{serie.nom}</h2>
<ol class="frise">
  {#each cartes as { c, a } (c.id)}
    <li>
      <span class="annee">{a ?? '—'}</span>
      <button class="titre" onclick={() => ui.ouvrirCarte(c.id)}>{c.title}</button>
      {#if c.dates}<span class="dates">{c.dates}</span>{/if}
    </li>
  {/each}
</ol>
<button class="encre" onclick={() => ui.fermer()}>Fermer</button>

<style>
  .centre { text-align: center; }
  .frise { list-style: none; margin: 0; padding: 0 0 0 26px; border-left: 4px solid var(--rouge); display: flex; flex-direction: column; gap: 16px; width: 100%; }
  li { position: relative; display: flex; flex-direction: column; gap: 2px; }
  li::before { content: ''; position: absolute; left: -35px; top: 6px; width: 14px; height: 14px; background: var(--papier); border: 4px solid var(--rouge); border-radius: 50%; }
  .annee { font-family: var(--f-affiche); font-weight: 900; font-size: 26px; line-height: 1; color: var(--rouge); font-variant-numeric: tabular-nums; }
  .titre { all: unset; cursor: pointer; font-family: var(--f-texte); font-size: 17px; font-weight: 600; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
  .titre:focus-visible { outline: 3px solid var(--rouge); outline-offset: 2px; }
  .dates { font-size: 13px; color: var(--discret); }
</style>
