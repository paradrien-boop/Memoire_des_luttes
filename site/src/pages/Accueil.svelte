<script lang="ts">
  import QRCode from 'qrcode'
  import site from 'virtual:mdl-site'

  const adresseApp = new URL('./app/', location.href).href
  let qr = $state('')
  $effect(() => { QRCode.toDataURL(adresseApp, { margin: 1, width: 480, color: { dark: '#1C1816', light: '#FFFFFF' } }).then((u) => (qr = u)) })
  const officielles = site.cartes.length
</script>

<section class="une">
  <div class="texte">
    <div class="surtitre">Cartes à collectionner · sans compte, sans GPS, sans réseau</div>
    <h1>Mémoire<br />des luttes</h1>
    <p class="chapeau">Tu gagnes des boosters en étant dans la rue. Chaque carte raconte une personne, un événement, une idée, un livre ou un chant de l'histoire des luttes.</p>
    <div class="ligne">
      <a class="bouton rouge" href="./app/">Ouvrir l'app</a>
      <a class="bouton" href="#installer">L'installer</a>
    </div>
  </div>
  <figure class="qr">
    {#if qr}<img src={qr} alt="QR code vers l'app" />{/if}
    <figcaption>Scanne pour ouvrir l'app sur ton téléphone</figcaption>
  </figure>
</section>

<section class="trois">
  <div><h2>En manif</h2><p>Lance le compteur en arrivant : un booster toutes les 45 minutes. Scanne les QR des stands pour des cartes rares, et ceux des cartes d'événement, numérotées et uniques.</p></div>
  <div><h2>Entre camarades</h2><p>Donne tes cartes en double par QR, téléphone contre téléphone. Écris tes propres cartes et partage-les.</p></div>
  <div><h2>Chaque jour</h2><p>Trois questions sur tes cartes. Les bonnes réponses font grandir ton chat noir et construisent son quartier.</p></div>
</section>

<section class="encart">
  <h2>Ce que l'app ne fait pas</h2>
  <ul>
    <li><b>Pas de compte.</b> Personne ne sait qui joue.</li>
    <li><b>Pas de GPS.</b> La présence se prouve par le temps et par les QR.</li>
    <li><b>Pas de réseau</b> pendant la manif : une fois installée, elle marche en mode avion.</li>
    <li><b>Rien ne quitte ton téléphone</b>, et un bouton efface tout d'un geste.</li>
  </ul>
</section>

<section id="installer" class="pile">
  <h2>L'installer</h2>
  <div class="deux">
    <div class="encart"><h3>Android</h3><ol><li>Ouvre <a href="./app/">l'app</a> dans Chrome.</li><li>Touche « Installer l'app » sur l'écran d'accueil, ou le menu ⋮ puis « Installer l'application ».</li></ol></div>
    <div class="encart"><h3>iPhone</h3><ol><li>Ouvre <a href="./app/">l'app</a> dans Safari.</li><li>Touche Partager (le carré avec une flèche), puis « Sur l'écran d'accueil ».</li></ol></div>
  </div>
  <p class="discret">Ouvre l'app une fois avec du réseau : elle se prépare pour fonctionner ensuite sans réseau.</p>
</section>

<section class="pile">
  <h2>Vérifier que c'est la bonne app</h2>
  {#if site.cles.empreintes.length}
    <p>Dans l'app, va dans <b>Plus › Packs</b> : l'empreinte de la clé du collectif doit être exactement celle-ci.</p>
    {#each site.cles.empreintes as e (e)}<p class="empreinte">{e}</p>{/each}
  {:else}
    <p class="note">Le collectif n'a pas encore publié sa clé. Les packs signés et les QR de stand arriveront avec elle.</p>
  {/if}
</section>

<p class="discret">En ce moment : {officielles} cartes, {site.packs.length} pack{site.packs.length > 1 ? 's' : ''}, {site.evenements} carte{site.evenements > 1 ? 's' : ''} d'événement.</p>

<style>
  section { margin-bottom: 40px; }
  .une { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 32px; align-items: center; }
  @media (max-width: 680px) { .une { grid-template-columns: minmax(0, 1fr); } .qr { max-width: 220px; } }
  h1 { font-size: clamp(56px, 12vw, 104px); color: var(--rouge); margin: 6px 0 14px; }
  .chapeau { font-family: var(--f-texte); font-size: 20px; line-height: 1.4; max-width: 34ch; margin-bottom: 18px; }
  .bouton { text-decoration: none; display: inline-block; }
  a.bouton.rouge { background: var(--rouge); border-color: var(--rouge); color: var(--sur-rouge); }
  .qr { margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .qr img { width: 100%; border: 3px solid var(--encre); background: #fff; image-rendering: pixelated; }
  .qr figcaption { font-size: 13px; color: var(--discret); }
  .trois { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  @media (max-width: 680px) { .trois { grid-template-columns: minmax(0, 1fr); } }
  .trois p, .encart li, ol { font-family: var(--f-texte); line-height: 1.5; }
  h2 { margin-bottom: 8px; }
  h3 { font-size: 22px; }
  ul, ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
  .deux { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 680px) { .deux { grid-template-columns: minmax(0, 1fr); } }
  .empreinte { font-family: ui-monospace, Menlo, monospace; font-size: 22px; font-weight: 700; letter-spacing: .05em; }
  a { color: inherit; }
</style>
