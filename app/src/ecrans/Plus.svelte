<script lang="ts">
  import Entete from '../composants/Entete.svelte'
  import CreationPersonnage from '../composants/CreationPersonnage.svelte'
  import ChoixActions from '../composants/ChoixActions.svelte'
  import ChoixEquipement from '../composants/ChoixEquipement.svelte'
  import BoutonConfirme from '../composants/BoutonConfirme.svelte'
  import GuideInstallation from '../composants/GuideInstallation.svelte'
  import Packs from '../composants/Packs.svelte'
  import ReglageCode from '../composants/ReglageCode.svelte'
  import { jeu } from '../etat/jeu.svelte'
</script>

<Entete surtitre="Ton personnage, tes actions, tes réglages" titre="Profil" />

<div class="pile">
  <section class="encart" id="personnage">
    <h2>Mon personnage</h2>
    <CreationPersonnage />
  </section>

  <section class="encart" id="equipement">
    <h2>Son équipement</h2>
    <ChoixEquipement />
  </section>

  <section class="encart" id="actions">
    <h2>Mes actions militantes</h2>
    <ChoixActions />
  </section>

  <h2 class="reglages">Réglages</h2>
  <section class="encart">
    <h2>Rien ne sort de ton téléphone</h2>
    <p>Pas de compte, pas de GPS, pas de réseau une fois l'app installée. Ta collection est stockée uniquement sur ce téléphone. Personne, y compris le collectif qui fait l'app, ne sait qui joue ni où.</p>
  </section>

  <section class="encart">
    <h2>Installer l'app</h2>
    <GuideInstallation />
  </section>

  <section class="encart">
    <h2>D'où viennent les cartes</h2>
    <div class="confiance">
      <b class="or">✊ Officiel</b><span>Signé par la clé du collectif. Relu et sourcé. Seuls ces packs tombent dans les boosters.</span>
      <b>✊ Local</b><span>Signé par un collectif local. Tu choisis de lui faire confiance.</span>
      <b class="discret">Perso</b><span>Fait par n'importe qui, sans signature. Visible dans l'album, jamais dans les boosters.</span>
      <b class="rouge-texte">🔒 Événement</b><span>Créée par le collectif pour une seule journée. Numérotée, tirage limité, scellée.</span>
    </div>
  </section>

  <section class="encart" id="packs">
    <h2>Packs</h2>
    <Packs />
  </section>

  <section class="encart">
    <h2>Comment naît une carte officielle</h2>
    <ol class="pile">
      <li><b>Proposition.</b> N'importe qui écrit une carte dans l'éditeur et l'envoie au collectif, de façon anonyme.</li>
      <li><b>Relecture.</b> Deux personnes vérifient chaque fait et chaque source.</li>
      <li><b>Signature.</b> La personne qui garde la clé du collectif signe le pack sur un ordinateur jamais connecté à Internet.</li>
      <li><b>Diffusion.</b> Le pack signé circule de main en main ou en téléchargement. Chaque téléphone vérifie la signature tout seul.</li>
    </ol>
  </section>

  <section class="encart">
    <h2>Mode discret</h2>
    <ReglageCode />
  </section>

  <section class="encart">
    <h2>Tout effacer</h2>
    <p>Supprime ta collection, tes cartes perso et ton historique de ce téléphone, d'un seul coup.</p>
    <div class="ligne"><BoutonConfirme classe="rouge" libelle="Tout effacer" confirmation="Oui, tout effacer" action={() => jeu.toutEffacer()} /></div>
  </section>
</div>

<style>
  .reglages { margin-top: 12px; border-bottom: 4px solid var(--encre); padding-bottom: 6px; }
  .confiance { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 14px; }
  .confiance b { font-family: var(--f-affiche); font-size: 18px; text-transform: uppercase; }
  .or { color: var(--or); }
  .rouge-texte { color: var(--rouge); }
  ol { margin: 0; padding-left: 20px; gap: 8px; }
</style>
