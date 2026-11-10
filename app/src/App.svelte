<script lang="ts">
  import BarreOnglets from './composants/BarreOnglets.svelte'
  import Fenetre from './composants/Fenetre.svelte'
  import CarteGrande from './composants/Carte.svelte'
  import RevelationBooster from './composants/RevelationBooster.svelte'
  import Annonce from './composants/Annonce.svelte'
  import Accueil from './composants/Accueil.svelte'
  import BandeauMiseAJour from './composants/BandeauMiseAJour.svelte'
  import { miseAJour } from './etat/mise-a-jour.svelte'
  import Manif from './ecrans/Manif.svelte'
  import Album from './ecrans/Album.svelte'
  import Editeur from './ecrans/Editeur.svelte'
  import Plus from './ecrans/Plus.svelte'
  import Quartier from './ecrans/Quartier.svelte'
  import Dessins from './ecrans/Dessins.svelte'
  import { quartier } from './etat/quartier.svelte'
  import Scanner from './composants/Scanner.svelte'
  import QrAffiche from './composants/QrAffiche.svelte'
  import EcranVerrou from './composants/EcranVerrou.svelte'
  import Frise from './composants/Frise.svelte'
  import { verrou } from './etat/verrou.svelte'
  import { untrack } from 'svelte'
  import { ecranDepuisAdresse } from './navigation'
  import { jeu } from './etat/jeu.svelte'
  import { ui } from './etat/interface.svelte'

  let ecran = $state(ecranDepuisAdresse(location.hash))
  let erreur = $state('')
  let cleEditeur = $state(0) // change pour recharger l'éditeur avec une autre carte

  Promise.all([jeu.charger(), quartier.charger(), verrou.charger()]).catch((e) => (erreur = String(e?.message ?? e)))
  miseAJour.demarrer()

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

  function donner(id: string) {
    try { ui.qr = { titre: jeu.carte(id)!.title, texte: jeu.qrDon(id), don: id } } catch (e) { ui.annoncer((e as Error).message) }
  }

  function partager(id: string) {
    const c = jeu.carte(id)
    if (!c) return
    try { ui.qr = { titre: c.title, texte: jeu.qrPerso(c) } } catch (e) { ui.annoncer((e as Error).message) }
  }

  async function confirmerDon(id: string) {
    await jeu.confirmerDon(id)
    const b = await quartier.bonusDon()
    ui.fermer()
    ui.annoncer(b.booster ? 'Carte donnée. 5 fragments réunis : un booster de plus !' : b.fragment ? 'Carte donnée. Merci ! Un fragment de booster pour toi.' : 'Carte donnée. Merci !')
  }

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
  {:else if jeu.pret && quartier.pret && !verrou.verrouille}
    {#if ecran === 'manif'}<Manif />
    {:else if ecran === 'album'}<Album />
    {:else if ecran === 'quartier'}<Quartier />
    {:else if ecran === 'dessins'}<Dessins />
    {:else if ecran === 'editeur'}{#key cleEditeur}<Editeur />{/key}
    {:else}<Plus />{/if}
  {/if}
</main>
<BarreOnglets actif={ecran} />
<Annonce />
<BandeauMiseAJour />
{#if verrou.verrouille}<EcranVerrou />{/if}

{#if jeu.pret && !jeu.accueilVu}
  <Fenetre titre="Bienvenue" fermer={() => jeu.fermerAccueil()}><Accueil /></Fenetre>
{/if}

{#if ui.booster}
  <Fenetre titre="Ouverture du booster" fermer={() => ui.fermer()}><RevelationBooster resultat={ui.booster} /></Fenetre>
{:else if ui.frise}
  <Fenetre titre="Frise chronologique" fermer={() => ui.fermer()}><Frise serieId={ui.frise} /></Fenetre>
{:else if ui.scanner}
  <Fenetre titre="Scanner un QR" fermer={() => ui.fermer()}><Scanner /></Fenetre>
{:else if ui.qr}
  <Fenetre titre={ui.qr.don ? 'Donner une carte' : 'Partager une carte'} fermer={() => ui.fermer()}>
    <div class="surtitre">{ui.qr.don ? 'Donner un exemplaire' : 'Partager ta carte'}</div>
    <h2 class="centre">{ui.qr.titre}</h2>
    <QrAffiche texte={ui.qr.texte} legende={ui.qr.don ? 'QR pour donner cette carte' : 'QR de ta carte perso'} />
    {#if ui.qr.don}
      {@const id = ui.qr.don}
      <p class="centre">Ton ou ta camarade ouvre « Scanner un QR » et vise cet écran. Ensuite, confirme : l'exemplaire quittera ton album.</p>
      <button class="rouge" onclick={() => confirmerDon(id)}>C'est fait, je l'ai donnée</button>
    {:else}
      <p class="centre">Ton ou ta camarade ouvre « Scanner un QR » et vise cet écran. Tu gardes ta carte.</p>
    {/if}
    <button class="encre" onclick={() => ui.fermer()}>{ui.qr.don ? 'Annuler' : 'Fermer'}</button>
  </Fenetre>
{:else if carteOuverte}
  <Fenetre titre={carteOuverte.title} fermer={() => ui.fermer()}>
    <CarteGrande carte={carteOuverte} />
    {#if carteOuverte.origine === 'perso'}
      <div class="ligne">
        <button class="rouge" onclick={() => modifier(carteOuverte.id)}>Modifier</button>
        {#if !carteOuverte.img}<button onclick={() => partager(carteOuverte.id)}>Partager par QR</button>{/if}
      </div>
    {:else if carteOuverte.origine === 'officiel' || carteOuverte.origine === 'local' || carteOuverte.origine === 'evenement'}
      {#if carteOuverte.origine !== 'evenement' && (jeu.possessions[carteOuverte.id] ?? 0) > 1}
        <button class="rouge" onclick={() => donner(carteOuverte.id)}>Donner un exemplaire ({jeu.possessions[carteOuverte.id]} en ta possession)</button>
      {/if}
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
  .centre { text-align: center; }
</style>
