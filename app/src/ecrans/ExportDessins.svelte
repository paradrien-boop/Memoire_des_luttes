<script lang="ts">
  // Page de développement (#dessins-export) : chaque dessin actuel dans le cadre de son gabarit,
  // pour scripts/exporter-dessins.mjs, qui en fait des modèles SVG (data/dessins/modeles/).
  import Scene from '../dessins/Scene.svelte'
  import Personnage from '../dessins/Personnage.svelte'
  import Ennemi from '../dessins/Ennemi.svelte'
  import Chat from '../dessins/Chat.svelte'
  import { CADRES } from '../dessins/fichiers'
  import { ELEMENTS, OBJETS } from '@mdl/noyau'

  const vb = (c: { x: number; y: number; l: number; h: number }) => `${c.x} ${c.y} ${c.l} ${c.h}`
  const tout = (n: number) => Object.fromEntries(Object.keys(ELEMENTS).map((f) => [f, n]))
</script>

<div class="export">
  {#each [0, 1, 2] as c (c)}
    {#each ['repos', 'victoire', 'sonne'] as pose (pose)}
      <svg data-nom="personnage/base-{c}{pose === 'repos' ? '' : '-' + pose}" viewBox={vb(CADRES.personnage)} xmlns="http://www.w3.org/2000/svg">
        <!-- La peau est en magenta (#FF00FF) : l'app la remplace par le teint choisi. -->
        <Personnage teint={-1} coiffure={c} pose={pose as 'repos'} />
      </svg>
    {/each}
  {/each}
  {#each OBJETS as o (o.id)}
    <svg data-nom="personnage/objets/{o.id}" viewBox={vb(CADRES.personnage)} xmlns="http://www.w3.org/2000/svg">
      <Personnage corps={false} equipe={{ [o.emplacement]: o.id }} />
    </svg>
  {/each}
  {#each ['soldat', 'proprietaire', 'patron', 'censeur', 'mouchard', 'general'] as d (d)}
    <svg data-nom="ennemis/{d}" viewBox={vb(CADRES.ennemis)} xmlns="http://www.w3.org/2000/svg"><Ennemi dessin={d} /></svg>
  {/each}
  {#each [0, 1, 2, 3, 4] as s (s)}
    <svg data-nom="chat/stade-{s}" viewBox={vb(CADRES.chat)} xmlns="http://www.w3.org/2000/svg"><Chat stade={s} /></svg>
    <svg data-nom="chat/stade-{s}-endormi" viewBox={vb(CADRES.chat)} xmlns="http://www.w3.org/2000/svg"><Chat stade={s} dort /></svg>
  {/each}
  {#each [0, 1, 2, 3] as n (n)}
    <div data-scene="quartier/exemple-niveau-{n}"><Scene niveaux={tout(n)} stade={0} heure={12} /></div>
  {/each}
</div>

<style>
  .export { display: flex; flex-wrap: wrap; gap: 8px; }
  .export svg { width: 120px; height: auto; border: 1px solid #ccc; }
  .export div { width: 400px; }
</style>
