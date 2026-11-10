<script lang="ts">
  import Entete from '../composants/Entete.svelte'
  import CarteMini from '../composants/CarteMini.svelte'
  import CarteCachee from '../composants/CarteCachee.svelte'
  import CarteDesIdees from '../composants/CarteDesIdees.svelte'
  import { ui } from '../etat/interface.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { catalogue } from '../donnees'

  const evenements = $derived(jeu.evenements.map((e) => jeu.carte(e.id)).filter((c) => c !== null))
  // Numéro de chaque carte officielle dans l'album, toutes séries confondues.
  const numeros = Object.fromEntries(catalogue.officielles.map((c, i) => [c.id, i + 1]))
  const possede = (id: string) => (jeu.possessions[id] ?? 0) > 0
</script>

<Entete surtitre="Ta collection" titre="Album" marque={`${jeu.nombreOfficielles}/${catalogue.officielles.length}`} />

<div class="pile">
  <section class="serie">
    <div class="tete">
      <div><h2>Cartes d'événement</h2><p class="discret">Uniques, numérotées, scellées. On ne les obtient qu'en étant sur place le jour J.</p></div>
      <span class="compte">{evenements.length}</span>
    </div>
    {#if evenements.length}
      <div class="grille">{#each evenements as c (c.id)}<CarteMini carte={c} />{/each}</div>
    {:else}
      <p class="discret">Aucune pour l'instant. Elles se gagnent en scannant le QR d'un stand officiel pendant une manif.</p>
    {/if}
  </section>

  {#each catalogue.series as serie (serie.id)}
    {@const trouvees = serie.cartes.filter(possede).length}
    <section class="serie" class:complete={trouvees === serie.cartes.length}>
      <div class="tete">
        <div>
          <h2>{serie.nom}</h2>
          <p class="discret">{serie.description}{#if trouvees === serie.cartes.length} · <b class="rouge-texte">Série complète !</b>{/if}</p>
          {#if trouvees === serie.cartes.length}<button class="frise" onclick={() => (ui.frise = serie.id)}>Voir la frise chronologique</button>{/if}
        </div>
        <span class="compte">{trouvees}/{serie.cartes.length}</span>
      </div>
      <div class="grille">
        {#each serie.cartes as id (id)}
          {#if possede(id)}<CarteMini carte={catalogue.parId[id]} nombre={jeu.possessions[id]} />
          {:else}<CarteCachee numero={numeros[id]} rarete={catalogue.parId[id].rar} />{/if}
        {/each}
      </div>
    </section>
  {/each}

  <CarteDesIdees />

  {#if jeu.perso.length}
    <section class="serie">
      <div class="tete"><div><h2>Mes cartes</h2><p class="discret">Faites avec l'éditeur. Elles ne tombent pas dans les boosters.</p></div><span class="compte">{jeu.perso.length}</span></div>
      <div class="grille">{#each jeu.perso as c (c.id)}<CarteMini carte={c} />{/each}</div>
    </section>
  {/if}

  {#each jeu.importes as pack (pack.cle)}
    <section class="serie">
      <div class="tete"><div><h2>{pack.nom}</h2><p class="discret">Pack importé, non signé</p></div><span class="compte">{pack.cartes.length}</span></div>
      <div class="grille">{#each pack.cartes as c (c.id)}<CarteMini carte={c} />{/each}</div>
    </section>
  {/each}
</div>

<style>
  .serie { display: flex; flex-direction: column; gap: 12px; padding-bottom: 12px; }
  .tete { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; border-bottom: 2px solid var(--encre); padding-bottom: 6px; }
  .complete .tete { border-color: var(--rouge); }
  .tete p { font-size: 13px; }
  .compte { font-family: var(--f-affiche); font-weight: 900; font-size: 22px; color: var(--rouge); font-variant-numeric: tabular-nums; }
  .rouge-texte { color: var(--rouge); }
  .frise { margin-top: 6px; padding: 5px 10px; font-size: 11px; background: var(--rouge); border-color: var(--rouge); color: var(--sur-rouge); }
</style>
