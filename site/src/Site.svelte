<script lang="ts">
  import Accueil from './pages/Accueil.svelte'
  import Cartes from './pages/Cartes.svelte'
  import Packs from './pages/Packs.svelte'
  import Collectifs from './pages/Collectifs.svelte'
  import Cles from './pages/Cles.svelte'
  import Participer from './pages/Participer.svelte'

  const PAGES = { accueil: 'Accueil', cartes: 'Les cartes', packs: 'Packs', collectifs: 'Collectifs', cles: 'Clés', participer: 'Participer' } as const
  type Page = keyof typeof PAGES
  const depuis = (h: string): Page => (h.slice(1) in PAGES ? (h.slice(1) as Page) : 'accueil')
  let page = $state<Page>(depuis(location.hash))
  $effect(() => {
    const suivre = () => { page = depuis(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', suivre)
    return () => removeEventListener('hashchange', suivre)
  })
</script>

<header>
  <div class="interieur">
    <a class="marque" href="#accueil">Mémoire<br />des luttes</a>
    <nav aria-label="Pages du site">
      {#each Object.entries(PAGES) as [id, nom] (id)}
        <a href={'#' + id} aria-current={page === id ? 'page' : undefined}>{nom}</a>
      {/each}
      <a class="app" href="./app/">Ouvrir l'app</a>
    </nav>
  </div>
</header>

<main>
  {#if page === 'accueil'}<Accueil />
  {:else if page === 'cartes'}<Cartes />
  {:else if page === 'packs'}<Packs />
  {:else if page === 'collectifs'}<Collectifs />
  {:else if page === 'cles'}<Cles />
  {:else}<Participer />{/if}
</main>

<footer>
  <div class="interieur">
    <p>Code sous licence AGPL-3.0, cartes sous licence CC BY-SA 4.0. Ce site ne dépose aucun cookie, ne mesure aucune visite et ne charge rien depuis un autre site.</p>
  </div>
</footer>

<style>
  .interieur { max-width: 960px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  header { background: var(--encre); color: var(--papier); padding-top: env(safe-area-inset-top, 0px); }
  header .interieur { display: flex; gap: 16px 24px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding-block: 12px; }
  .marque { font-family: var(--f-affiche); font-weight: 900; font-size: 22px; line-height: .9; text-transform: uppercase; color: var(--papier); text-decoration: none; }
  nav { display: flex; gap: 4px 16px; flex-wrap: wrap; align-items: center; }
  nav a { color: var(--papier); text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; padding: 6px 0; border-bottom: 3px solid transparent; }
  nav a[aria-current='page'] { border-color: var(--rouge); }
  nav a.app { background: var(--rouge); color: var(--sur-rouge); padding: 6px 12px; border: 0; }
  main { max-width: 960px; margin: 0 auto; padding: 32px max(16px, env(safe-area-inset-right, 0px)) 48px max(16px, env(safe-area-inset-left, 0px)); }
  footer { border-top: 4px solid var(--encre); padding-block: 20px calc(20px + env(safe-area-inset-bottom, 0px)); color: var(--discret); font-size: 13px; }
  footer p { max-width: 65ch; }
</style>
