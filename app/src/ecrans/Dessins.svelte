<script lang="ts">
  // Planche de travail des dessins (seulement en développement, adresse #dessins) :
  // tous les stades du chat et tous les niveaux du quartier, pour les illustrateurs et illustratrices.
  import Scene from '../dessins/Scene.svelte'
  import { ELEMENTS } from '@mdl/noyau'

  const tout = (n: number) => Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, n]))
</script>

<div class="pile">
  <h1>Planche des dessins</h1>
  {#each [0, 1, 2, 3] as n (n)}
    <h2>Quartier au niveau {n} · chat au stade {n}</h2>
    <Scene niveaux={tout(n)} stade={n} accessoires={n === 3 ? ['cocarde'] : []} />
  {/each}
  <h2>Chat sauvage, jour de manif, accessoires</h2>
  <Scene niveaux={tout(3)} stade={4} pancarte accessoires={['cocarde', 'partition']} />
  <h2>Chat endormi</h2>
  <Scene niveaux={tout(1)} stade={1} dort />
</div>
