<script lang="ts">
  import BarreOnglets from './composants/BarreOnglets.svelte'
  import Fenetre from './composants/Fenetre.svelte'
  import CarteGrande from './composants/Carte.svelte'
  import RevelationBooster from './composants/RevelationBooster.svelte'
  import Annonce from './composants/Annonce.svelte'
  import Manif from './ecrans/Manif.svelte'
  import Album from './ecrans/Album.svelte'
  import Editeur from './ecrans/Editeur.svelte'
  import Plus from './ecrans/Plus.svelte'
  import { untrack } from 'svelte'
  import { ecranDepuisAdresse } from './navigation'
  import { jeu } from './etat/jeu.svelte'
  import { ui } from './etat/interface.svelte'

  let ecran = $state(ecranDepuisAdresse(location.hash))
  let erreur = $state('')
  let cleEditeur = $state(0) // change pour recharger l'éditeur avec une autre carte

  jeu.charger().catch((e) => (erreur = String(e?.message ?? e)))

  $effect(() => {
    const suivre = () => { ecran = ecranDepuisAdresse(location.hash); ui.fermer(); scrollTo(0, 0) }
    addEventListener('hashchange', suivre)
    return () => removeEventListener('hashchange', suivre)
  })

  // Pendant une manif, le compteur avance chaque seconde, et dès que l'app revient au premier plan.
  // L'effet ne dépend que de « une manif est-elle en cours ? », pas du compteur qu'il fait lui-même avancer.
  const enManif = $derived(jeu.pret && jeu.chrono.session !== null)
  $effect(() => {
    if (!enManif) return
    const avancer = () => untrack(async () => {
      const r = await jeu.avancer()
      if (r.nouveauxBoosters) ui.annoncer(r.nouveauxBoosters > 1 ? `${r.nouveauxBoosters} nouveaux boosters !` : 'Nouveau booster gagné !')
      if (r.jourValide) ui.annoncer(`Jour de manif validé : ${jeu.chrono.jours.length} au compteur`)
    })
    avancer()
    const minuteur = setInterval(avancer, 1000)
    const visible = () => { if (document.visibilityState === 'visible') avancer() }
    document.addEventListener('visibilitychange', visible)
    return () => { clearInterval(minuteur); document.removeEventListener('visibilitychange', visible) }
  })

  const carteOuverte = $derived(ui.carteOuverte ? jeu.carte(ui.carteOuverte) : null)

  function modifier(id: string) {
    ui.aModifier = id
    ui.fermer()
    cleEditeur++
    location.hash = '#editeur'
  }
</script>

<main>
  {#if erreur}
    <div class="encart"><h2>L'app n'a pas pu démarrer</h2><p>La base de données du téléphone n'est pas accessible ({erreur}). Une navigation privée peut la bloquer.</p></div>
  {:else if jeu.pret}
    {#if ecran === 'manif'}<Manif />
    {:else if ecran === 'album'}<Album />
    {:else if ecran === 'editeur'}{#key cleEditeur}<Editeur />{/key}
    {:else}<Plus />{/if}
  {/if}
</main>
<BarreOnglets actif={ecran} />
<Annonce />

{#if ui.booster}
  <Fenetre titre="Ouverture du booster" fermer={() => ui.fermer()}><RevelationBooster resultat={ui.booster} /></Fenetre>
{:else if carteOuverte}
  <Fenetre titre={carteOuverte.title} fermer={() => ui.fermer()}>
    <CarteGrande carte={carteOuverte} />
    {#if carteOuverte.origine === 'perso'}
      <button class="rouge" onclick={() => modifier(carteOuverte.id)}>Modifier</button>
    {:else if carteOuverte.origine === 'officiel' || carteOuverte.origine === 'evenement'}
      <p class="discret petit">Carte signée : personne ne peut la modifier, pas même toi.</p>
    {/if}
    <button class="encre" onclick={() => ui.fermer()}>Fermer</button>
  </Fenetre>
{/if}

<style>
  main {
    max-width: 760px; margin: 0 auto;
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px));
  }
  .petit { font-size: 13px; text-align: center; }
</style>
