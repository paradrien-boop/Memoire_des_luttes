<script lang="ts">
  import site from 'virtual:mdl-site'
</script>

<div class="pile">
  <div><div class="surtitre">Écrire l'histoire des luttes</div><h1>Participer</h1></div>

  <section class="encart">
    <h2>Proposer une carte</h2>
    <ol>
      <li>Dans l'app, onglet <b>Éditeur</b> : choisis la famille (personnalité, événement, chant…) et remplis les rubriques. Chaque fait a besoin d'une source.</li>
      <li>Exporte ta carte en pack, et envoie le texte au collectif. Tu peux rester anonyme.</li>
      <li>Deux personnes relisent chaque fait et chaque source, et retravaillent le texte avec toi si besoin.</li>
      <li>Une fois validée, la carte entre dans un pack officiel signé.</li>
    </ol>
  </section>

  <section class="encart">
    <h2>Corriger une carte</h2>
    <p>Une date fausse, une source douteuse, une formulation à revoir : signale-le, avec la source qui justifie la correction. Voir <a href="#cartes">les cartes et leur état</a>.</p>
  </section>

  <section class="encart">
    <h2>Dessiner</h2>
    <p>Le chat, le quartier, le personnage, ses objets et les adversaires peuvent être redessinés. L'<b>atelier de dessin</b> montre tout de suite tes fichiers dans les vraies scènes de l'app, sans rien envoyer : tes dessins restent sur ton ordinateur.</p>
    <p><a class="bouton" href="./app/atelier.html">Ouvrir l'atelier de dessin</a></p>
  </section>

  <section class="encart">
    <h2>Débattre</h2>
    {#if site.config.lienDebat}
      <p>Les discussions sur les cartes, proposées ou publiées, ont lieu ici :</p>
      <p><a class="bouton" href={site.config.lienDebat} rel="noopener">Aller à l'espace de débat</a></p>
    {:else}
      <p>{site.config.texteDebat}</p>
    {/if}
    <h3>Règles du débat</h3>
    <ul>
      <li>On discute des faits et des formulations, pas des personnes.</li>
      <li>Une affirmation sans source ne va pas sur une carte.</li>
      <li>Militant dans le regard, rigoureux dans les faits.</li>
      <li>Rien qui permette d'identifier quelqu'un : nom réel, adresse, photo de manif reconnaissable.</li>
    </ul>
  </section>
</div>

<style>
  h1 { font-size: 56px; }
  ol, ul, p { font-family: var(--f-texte); font-size: 16px; line-height: 1.5; max-width: 65ch; }
  ol, ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
  h3 { font-size: 20px; margin-top: 6px; }
  a { color: inherit; }
  .bouton { text-decoration: none; display: inline-block; font-family: var(--f-interface); }
</style>
