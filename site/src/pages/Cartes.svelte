<script lang="ts">
  import site from 'virtual:mdl-site'
  const STATUTS: Record<string, string> = { proposee: 'Proposée', 'a-relire': 'À relire', validee: 'Validée', signee: 'Signée' }
  const RARETES: Record<string, string> = { base: 'Base', rare: 'Rare ★', legendaire: 'Légendaire ★★★' }
  let filtre = $state('toutes')
  const visibles = $derived(site.cartes.filter((c) => filtre === 'toutes' || c.statut === filtre))
  const series = $derived([...new Set(visibles.map((c) => c.serie))])
  const compte = (s: string) => site.cartes.filter((c) => c.statut === s).length
</script>

<div class="pile">
  <div>
    <div class="surtitre">La base de cartes</div>
    <h1>Les cartes</h1>
  </div>
  <p class="intro">Toutes les cartes des packs, avec leur état de relecture. Une carte ne devient officielle qu'après la vérification de chaque fait et de chaque source par deux personnes, puis la signature du collectif.</p>

  <div class="filtres" role="group" aria-label="Filtrer par état">
    <button class:actif={filtre === 'toutes'} onclick={() => (filtre = 'toutes')}>Toutes ({site.cartes.length})</button>
    {#each Object.entries(STATUTS) as [s, nom] (s)}
      {#if compte(s)}<button class:actif={filtre === s} onclick={() => (filtre = s)}>{nom} ({compte(s)})</button>{/if}
    {/each}
  </div>

  {#each series as serie (serie)}
    <section>
      <h2>{serie || 'Sans série'}</h2>
      <div class="tableau">
        <table>
          <thead><tr><th>Carte</th><th>Famille</th><th>Rareté</th><th>État</th>{#if site.config.lienDebat}<th><span class="visuellement-cache">Discussion</span></th>{/if}</tr></thead>
          <tbody>
            {#each visibles.filter((c) => c.serie === serie) as c (c.id)}
              <tr>
                <td class="titre">{c.title}</td>
                <td>{site.familles[c.fam] ?? c.fam}</td>
                <td>{RARETES[c.rar] ?? c.rar}</td>
                <td><span class="statut {c.statut}">{STATUTS[c.statut] ?? c.statut}</span></td>
                {#if site.config.lienDebat}<td><a href={site.config.lienDebat} rel="noopener">Discuter</a></td>{/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/each}
  <p class="discret">Le texte complet des cartes se lit dans l'app, au fil de la collection. Pour proposer une carte ou une correction : <a href="#participer">participer</a>.</p>
</div>

<style>
  h1 { font-size: 56px; }
  .intro { font-family: var(--f-texte); font-size: 17px; max-width: 65ch; line-height: 1.5; }
  .filtres { display: flex; gap: 8px; flex-wrap: wrap; }
  .filtres button { padding: 6px 12px; font-size: 12px; }
  .filtres button.actif { background: var(--encre); color: var(--papier); }
  section { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .tableau { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--discret); border-bottom: 2px solid var(--encre); padding: 6px 8px; }
  td { border-bottom: 1px solid var(--trait); padding: 8px; vertical-align: top; }
  .titre { font-family: var(--f-texte); font-weight: 600; }
  .statut { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
  .statut.a-relire, .statut.proposee { color: var(--rouge); }
  .statut.signee { color: var(--or); }
  a { color: inherit; }
  .visuellement-cache { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>
