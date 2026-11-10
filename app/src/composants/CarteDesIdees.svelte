<script lang="ts">
  // Carte des idées : les cartes possédées et leurs liens. Une carte liée pas encore trouvée apparaît en « ? ».
  import { disposer, ecarterEtiquettes, liensUniques, type Carte } from '@mdl/noyau'
  import { catalogue } from '../donnees'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { initiales } from '../outils'

  // Un nœud occupe son rond (rayon 20) et son nom dessous (jusqu'à 20 caractères) : environ 150 × 66.
  const L = 600, BORD = 78, BOITE = { l: 150, h: 66 }
  const possedees = $derived(catalogue.officielles.filter((c) => (jeu.possessions[c.id] ?? 0) > 0))
  const graphe = $derived.by(() => {
    const ids = new Set(possedees.map((c) => c.id))
    const liens = liensUniques(possedees as Carte[]).filter((l) => catalogue.parId[l.a] && catalogue.parId[l.b])
    const inconnues = [...new Set(liens.flatMap((l) => [l.a, l.b]).filter((id) => !ids.has(id)))]
    // Les nœuds restent loin des bords gauche et droit, pour que les noms des cartes ne soient pas coupés.
    // Hauteur selon le nombre de cartes, pour que les étiquettes aient toujours la place.
    const tous = [...ids, ...inconnues]
    const H = Math.max(380, Math.ceil(tous.length / 3) * 76 + 80)
    const noeuds = ecarterEtiquettes(
      disposer(tous, liens, L - 2 * BORD, H - 12, 34, 400, 1.2).map((n) => ({ ...n, x: n.x + BORD })),
      BOITE, L, H, { x: BORD, y: 34 },
    )
    const pos = Object.fromEntries(noeuds.map((n) => [n.id, n]))
    return { noeuds, pos, liens, possede: ids, H }
  })
  const court = (t: string) => (t.length > 20 ? t.slice(0, 19) + '…' : t)
</script>

{#if possedees.length >= 3}
  <section class="pile serree">
    <div class="tete"><div><h2>Carte des idées</h2><p class="discret">Les liens entre tes cartes. Un « ? » est une carte liée que tu n'as pas encore trouvée.</p></div></div>
    <svg viewBox="0 0 {L} {graphe.H}" role="group" aria-label="Carte des idées : {possedees.length} cartes, {graphe.liens.length} liens">
      {#each graphe.liens as l (l.a + l.b)}
        <line x1={graphe.pos[l.a].x} y1={graphe.pos[l.a].y - 11} x2={graphe.pos[l.b].x} y2={graphe.pos[l.b].y - 11}
          class:inconnu={!graphe.possede.has(l.a) || !graphe.possede.has(l.b)} />
      {/each}
      {#each graphe.noeuds as n (n.id)}
        {@const c = catalogue.parId[n.id]}
        {#if graphe.possede.has(n.id)}
          <g class="noeud r-{c.rar}" role="button" tabindex="0" transform="translate({n.x},{n.y - 11})"
            onclick={() => ui.ouvrirCarte(n.id)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ui.ouvrirCarte(n.id) } }}>
            <circle r="20" />
            <!-- Le titre complet nomme le nœud (balise title) ; les initiales et le nom raccourci sont décoratifs. -->
            <title>{c.title}</title>
            <text class="init" text-anchor="middle" dy="5" aria-hidden="true">{initiales(c.title)}</text>
            <text class="nom" text-anchor="middle" y="36" aria-hidden="true">{court(c.title)}</text>
          </g>
        {:else}
          <g class="noeud cache" transform="translate({n.x},{n.y - 11})" aria-hidden="true">
            <circle r="14" /><text class="init" text-anchor="middle" dy="5">?</text>
          </g>
        {/if}
      {/each}
    </svg>
  </section>
{/if}

<style>
  .serree { gap: 8px; }
  .tete { border-bottom: 2px solid var(--encre); padding-bottom: 6px; }
  .tete p { font-size: 13px; }
  svg { width: 100%; height: auto; display: block; background: var(--carte); border: 2px solid var(--encre); }
  line { stroke: var(--encre); stroke-width: 1.5; opacity: .5; }
  line.inconnu { stroke-dasharray: 4 4; opacity: .35; }
  .noeud { cursor: pointer; }
  .noeud:focus-visible circle { stroke: var(--rouge); stroke-width: 4; }
  .noeud circle { fill: var(--encre); stroke: var(--carte); stroke-width: 3; }
  .noeud.r-rare circle { fill: var(--rouge); }
  .noeud.r-legendaire circle { fill: var(--or); }
  .init { font-family: var(--f-affiche); font-weight: 900; font-size: 17px; fill: var(--carte); pointer-events: none; }
  .nom { font-family: var(--f-interface); font-weight: 700; font-size: 14px; fill: var(--encre); paint-order: stroke; stroke: var(--carte); stroke-width: 3px; pointer-events: none; }
  .cache { cursor: default; }
  .cache circle { fill: var(--carte); stroke: var(--trait); stroke-width: 2; stroke-dasharray: 3 3; }
  .cache .init { fill: var(--discret); }
</style>
