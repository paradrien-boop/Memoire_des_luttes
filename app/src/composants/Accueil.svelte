<script lang="ts">
  import GuideInstallation from './GuideInstallation.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { protegerDonnees } from '../etat/installation.svelte'

  async function commencer() {
    await protegerDonnees()
    await jeu.fermerAccueil()
  }
</script>

<div class="accueil">
  <div class="surtitre">Bienvenue</div>
  <h1>Mémoire<br />des luttes</h1>
  <p class="chapeau">Des cartes à collectionner sur l'histoire des luttes. Tu gagnes des boosters en étant dans la rue.</p>

  <div class="deux">
    <section>
      <h2>Ce que fait l'app</h2>
      <ul>
        <li>Compte ton temps de manif.</li>
        <li>Te donne des boosters de cartes.</li>
        <li>Te raconte des personnes, des événements, des idées, des chants.</li>
      </ul>
    </section>
    <section>
      <h2>Ce qu'elle ne fait pas</h2>
      <ul>
        <li>Pas de compte.</li>
        <li>Pas de GPS.</li>
        <li>Pas de réseau pendant la manif.</li>
        <li>Rien ne quitte ton téléphone.</li>
      </ul>
    </section>
  </div>

  <section class="encart">
    <h2>L'installer</h2>
    <GuideInstallation />
  </section>

  <button class="rouge geant" onclick={commencer}>C'est parti</button>
</div>

<style>
  .accueil { display: flex; flex-direction: column; gap: 18px; width: 100%; }
  h1 { font-size: 56px; color: var(--rouge); }
  .chapeau { font-family: var(--f-texte); font-size: 18px; line-height: 1.4; }
  .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 380px) { .deux { grid-template-columns: 1fr; } }
  section h2 { font-size: 22px; margin-bottom: 6px; }
  ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
  .geant { font-family: var(--f-affiche); font-size: 30px; font-weight: 900; padding: 14px 18px; width: 100%; }
</style>
