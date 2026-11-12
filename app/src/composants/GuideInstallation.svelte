<script lang="ts">
  import MiseAJourAndroid from './MiseAJourAndroid.svelte'
  import { installation } from '../etat/installation.svelte'
  import { miseAJour } from '../etat/mise-a-jour.svelte'
</script>

{#if import.meta.env.VITE_ANDROID}
  <MiseAJourAndroid />
{:else if import.meta.env.VITE_ARTEFACT}
  <p>Ceci est une <b>version de démonstration</b> en ligne. L'installation sur l'écran d'accueil et le mode avion fonctionnent dans la version publiée.</p>
{:else if installation.installee}
  <p><b>✓ L'app est installée.</b> Elle s'ouvre depuis l'écran d'accueil, comme une application.</p>
{:else if installation.invite}
  <p>Installe l'app sur ton écran d'accueil : elle s'ouvrira comme une application et marchera sans réseau.</p>
  <div><button class="rouge" onclick={() => installation.installer()}>Installer l'app</button></div>
{:else if installation.systeme === 'ios'}
  <p>Pour l'installer sur ton iPhone, ouvre cette page dans <b>Safari</b>, puis :</p>
  <ol>
    <li>touche le bouton <b>Partager</b> (le carré avec une flèche vers le haut) ;</li>
    <li>choisis <b>Sur l'écran d'accueil</b> ;</li>
    <li>touche <b>Ajouter</b>.</li>
  </ol>
{:else if installation.systeme === 'android'}
  <p>Pour l'installer, ouvre le menu du navigateur (les trois points) et choisis <b>Installer l'application</b> ou <b>Ajouter à l'écran d'accueil</b>.</p>
{:else}
  <p>Sur ordinateur, l'app fonctionne directement dans le navigateur. Pour l'avoir dans ta poche, ouvre cette adresse sur ton téléphone.</p>
{/if}

{#if !import.meta.env.VITE_ARTEFACT && !import.meta.env.VITE_ANDROID}<p class="etat" class:pret={miseAJour.horsLignePret}>
  {miseAJour.horsLignePret ? '✓ Prête à fonctionner sans réseau, même en mode avion.' : "Préparation du mode hors ligne… Garde le réseau quelques secondes."}
</p>{/if}

<style>
  ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
  .etat { font-size: 13px; color: var(--discret); }
  .etat.pret { color: var(--encre); font-weight: 700; }
</style>
