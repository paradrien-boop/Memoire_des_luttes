<script lang="ts">
  import type { Carte } from '@mdl/noyau'
  import { catalogue } from '../donnees'
  import { ui } from '../etat/interface.svelte'
  import { initiales } from '../outils'

  let { carte, nouvelle = false, nombre = 0, inerte = false }: { carte: Carte; nouvelle?: boolean; nombre?: number; inerte?: boolean } = $props()
</script>

<button class="mini r-{carte.rar}" tabindex={inerte ? -1 : 0} onclick={() => !inerte && ui.ouvrirCarte(carte.id)}>
  <div class="visuel" aria-hidden="true">{#if carte.img}<img src={carte.img} alt="" />{:else}<span>{initiales(carte.title)}</span>{/if}</div>
  <div class="titre">{carte.title}</div>
  <div class="famille">{catalogue.familles[carte.fam]?.libelle ?? ''}</div>
  {#if nouvelle}<span class="nouvelle">NOUVELLE</span>{/if}
  {#if nombre > 1}<span class="nombre">×{nombre}</span>{/if}
</button>

<style>
  .mini { all: unset; box-sizing: border-box; cursor: pointer; aspect-ratio: 5 / 7; width: 100%; max-width: 100%; background: var(--carte); border: 2px solid var(--encre); display: flex; flex-direction: column; position: relative; box-shadow: 3px 3px 0 var(--encre); color: var(--encre); }
  .mini:focus-visible { outline: 3px solid var(--rouge); outline-offset: 2px; }
  .r-rare { border-color: var(--rouge); box-shadow: 3px 3px 0 var(--rouge); }
  .r-legendaire { border-color: var(--or); box-shadow: 3px 3px 0 var(--or); }
  .r-evenement { border: 3px double var(--rouge); }
  .visuel { flex: 1; display: grid; place-items: center; overflow: hidden; background: radial-gradient(var(--trame) 34%, transparent 36%) 0 0 / 7px 7px; }
  .visuel span { font-family: var(--f-affiche); font-weight: 900; font-size: 40px; }
  .visuel img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.1); mix-blend-mode: multiply; }
  .titre { font-family: var(--f-affiche); font-weight: 900; text-transform: uppercase; font-size: 15px; line-height: 1; padding: 6px 6px 2px; text-wrap: balance; }
  .famille { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--discret); padding: 0 6px 6px; font-weight: 700; }
  .nouvelle { position: absolute; top: 4px; left: 4px; background: var(--rouge); color: var(--sur-rouge); font-size: 10px; font-weight: 700; padding: 1px 5px; letter-spacing: .06em; }
  .nombre { position: absolute; top: 4px; right: 4px; background: var(--encre); color: var(--papier); font-size: 11px; font-weight: 700; padding: 0 5px; }
</style>
