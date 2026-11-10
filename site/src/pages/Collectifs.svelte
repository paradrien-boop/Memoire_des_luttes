<script lang="ts">
  import site from 'virtual:mdl-site'
  const reconnus = site.collectifs.filter((c) => c.valide)
</script>

<div class="pile">
  <div><div class="surtitre">Annuaire</div><h1>Collectifs</h1></div>
  <p class="intro">Des collectifs locaux (sections syndicales, collectifs de quartier, associations) font leurs propres cartes, sur leurs luttes et leur ville. Le collectif Mémoire des luttes leur délivre une clé : leurs packs et leurs QR de stand sont alors reconnus par l'app, pour qui choisit de leur faire confiance.</p>

  {#if reconnus.length}
    <ul>
      {#each reconnus as c (c.id)}
        <li class="encart">
          <h2>{c.nom}</h2>
          {#if c.presentation}<p class="texte">{c.presentation}</p>{/if}
          {#if c.themes.length}<p class="themes">{c.themes.join(' · ')}</p>{/if}
          <p class="discret petit">Clé <code>{c.empreinte}</code> · reconnu jusqu'au {c.expire}</p>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="note">Aucun collectif n'est encore dans l'annuaire. Le tien peut être le premier.</p>
  {/if}
  <p class="discret petit">Apparaître ici est un choix : un collectif peut être reconnu sans figurer dans l'annuaire.</p>

  <section class="encart">
    <h2>Faire reconnaître ton collectif</h2>
    <ol>
      <li>Crée la clé de ton collectif sur la page <a href="#cles">Clés</a>, de préférence sur un ordinateur déconnecté d'Internet. La clé secrète reste chez vous.</li>
      <li>Envoie la demande de reconnaissance générée par cette page (elle ne contient que la clé publique).</li>
      <li>Deux collectifs déjà reconnus parrainent ta demande, puis le collectif signe une délégation : elle précise les raretés de cartes que tu peux créer et sa date d'expiration.</li>
      <li>Tu signes tes packs et tes QR de stand avec ta clé.</li>
    </ol>
  </section>
</div>

<style>
  h1 { font-size: 56px; }
  .intro, .texte, ol { font-family: var(--f-texte); font-size: 17px; max-width: 65ch; line-height: 1.5; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; font-size: 15px; }
  .themes { font-weight: 700; color: var(--rouge); font-size: 13px; text-transform: uppercase; letter-spacing: .06em; }
  .petit { font-size: 13px; }
  code { font-family: ui-monospace, Menlo, monospace; }
  a { color: inherit; }
</style>
