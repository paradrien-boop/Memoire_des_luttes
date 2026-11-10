<script lang="ts">
  import BarreOnglets from './composants/BarreOnglets.svelte'
  import Manif from './ecrans/Manif.svelte'
  import Album from './ecrans/Album.svelte'
  import Editeur from './ecrans/Editeur.svelte'
  import Plus from './ecrans/Plus.svelte'
  import { ecranDepuisAdresse } from './navigation'

  let ecran = $state(ecranDepuisAdresse(location.hash))
  $effect(() => {
    const suivre = () => { ecran = ecranDepuisAdresse(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', suivre)
    return () => removeEventListener('hashchange', suivre)
  })
</script>

<main>
  {#if ecran === 'manif'}<Manif />
  {:else if ecran === 'album'}<Album />
  {:else if ecran === 'editeur'}<Editeur />
  {:else}<Plus />{/if}
</main>
<BarreOnglets actif={ecran} />

<style>
  main {
    max-width: 760px; margin: 0 auto;
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px));
  }
</style>
