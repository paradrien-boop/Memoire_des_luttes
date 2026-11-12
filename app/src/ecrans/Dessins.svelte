<script lang="ts">
  // Planche de travail des dessins (seulement en développement, adresse #dessins) :
  // le quartier, le chat, le personnage et les adversaires, pour les illustrateurs et illustratrices.
  import Scene from '../dessins/Scene.svelte'
  import Personnage from '../dessins/Personnage.svelte'
  import Ennemi from '../dessins/Ennemi.svelte'
  import { ELEMENTS, OBJETS } from '@mdl/noyau'

  const tout = (n: number) => Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, n]))
  const objets = (n: number) => Object.fromEntries(Object.keys(OBJETS).map((f) => [f, n]))
  const perso = (n: number) => ({ teint: n % 4, coiffure: n % 3, objets: objets(n) })
</script>

<div class="pile">
  <h1>Planche des dessins</h1>
  {#each [0, 1, 2, 3] as n (n)}
    <h2>Quartier au niveau {n} · chat au stade {n} · personnage niveau {n}</h2>
    <Scene niveaux={tout(n)} stade={n} accessoires={n === 3 ? ['cocarde'] : []} personnage={perso(n)} foule={n * 2} heure={12} />
  {/each}
  <h2>La nuit, chat sauvage, jour de manif</h2>
  <Scene niveaux={tout(3)} stade={4} pancarte accessoires={['cocarde', 'partition']} personnage={perso(3)} foule={6} heure={23} />
  <h2>Chat endormi</h2>
  <Scene niveaux={tout(1)} stade={1} dort personnage={perso(0)} heure={12} />

  <h2>Le personnage : teints, coiffures, poses, objets</h2>
  <svg viewBox="0 -160 640 170" class="planche">
    {#each [0, 1, 2, 3] as t (t)}
      <g transform="translate({50 + t * 80},0)"><Personnage teint={t} coiffure={t % 3} objets={objets(t)} /></g>
    {/each}
    <g transform="translate(400,0)"><Personnage teint={1} coiffure={0} objets={objets(3)} pose="victoire" /></g>
    <g transform="translate(520,0)"><Personnage teint={2} coiffure={1} objets={objets(2)} pose="sonne" /></g>
  </svg>

  <h2>Les adversaires (menace)</h2>
  <svg viewBox="0 -150 640 160" class="planche">
    {#each ['soldat', 'proprietaire', 'patron', 'censeur', 'mouchard', 'general'] as d, i (d)}
      <g transform="translate({55 + i * 105},0)"><Ennemi dessin={d} /></g>
    {/each}
  </svg>
</div>

<style>
  .planche { width: 100%; height: auto; background: #EDE8E0; border: 2px solid #1C1816; }
</style>
