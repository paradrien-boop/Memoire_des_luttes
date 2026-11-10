<script lang="ts">
  import Entete from '../composants/Entete.svelte'
  import { catalogue } from '../donnees'
</script>

<Entete surtitre="Ta collection" titre="Album" />
<div class="pile">
  {#each catalogue.series as serie (serie.id)}
    <section>
      <div class="tete"><div><h2>{serie.nom}</h2>{#if serie.description}<p class="discret">{serie.description}</p>{/if}</div><span class="compte">{serie.cartes.length}</span></div>
      <ul>
        {#each serie.cartes as id (id)}<li>{catalogue.parId[id]?.title}</li>{/each}
      </ul>
    </section>
  {/each}
</div>

<style>
  .tete { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; border-bottom: 2px solid var(--encre); padding-bottom: 6px; }
  .tete p { font-size: 13px; }
  .compte { font-family: var(--f-affiche); font-weight: 900; font-size: 22px; color: var(--rouge); }
  ul { margin: 8px 0 0; padding-left: 18px; font-family: var(--f-texte); }
</style>
