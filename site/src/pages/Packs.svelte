<script lang="ts">
  import site from 'virtual:mdl-site'
  const BADGES: Record<string, string> = { officiel: '✊ Officiel, signature vérifiée', local: '✊ Local, signé par un collectif', 'non-signe': 'Brouillon, pas encore signé', invalide: '✗ Signature invalide' }
</script>

<div class="pile">
  <div><div class="surtitre">À installer dans l'app</div><h1>Packs</h1></div>
  <p class="intro">Un pack est un ensemble de cartes. Dans l'app, <b>Plus › Packs › Chercher de nouveaux packs</b> installe les packs signés de cette page en un geste. Tu peux aussi télécharger un fichier et le passer de main en main : chaque téléphone vérifie lui-même la signature, sans réseau.</p>
  <ul>
    {#each site.packs as p (p.id)}
      <li class="encart">
        <div class="ligne entre"><h2>{p.nom}</h2><span class="badge {p.confiance}">{BADGES[p.confiance]}</span></div>
        <p>{p.cartes} cartes{#if p.signataire} · signé par la clé <code>{p.signataire}</code>{/if}</p>
        <div><a class="bouton" href={'./' + p.fichier} download>Télécharger le pack</a></div>
      </li>
    {/each}
  </ul>
  <p class="note">Un pack non signé ne tombe jamais dans les boosters : ses cartes restent seulement dans l'album. Le collectif signe un pack une fois ses cartes relues.</p>
</div>

<style>
  h1 { font-size: 56px; }
  .intro { font-family: var(--f-texte); font-size: 17px; max-width: 65ch; line-height: 1.5; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .entre { justify-content: space-between; }
  h2 { font-size: 26px; }
  .badge { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
  .officiel { color: var(--or); } .local { color: var(--discret); } .non-signe { color: var(--discret); } .invalide { color: var(--rouge); }
  code { font-family: ui-monospace, Menlo, monospace; }
  .bouton { text-decoration: none; display: inline-block; }
</style>
