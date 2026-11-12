<script lang="ts">
  // L'arène d'une bataille : le personnage à gauche, l'adversaire historique à droite.
  // Victoire : l'adversaire détale dans un nuage (« POUF ! »). Défaite : le personnage voit des étoiles.
  import type { Ennemi } from '@mdl/noyau'
  import Personnage from '../dessins/Personnage.svelte'
  import DessinEnnemi from '../dessins/Ennemi.svelte'
  import { P } from '../dessins/palette'
  import { quartier } from '../etat/quartier.svelte'

  let { ennemi, etat = 'attente' }: { ennemi: Ennemi | null; etat?: 'attente' | 'victoire' | 'defaite' | 'seconde' } = $props()
  const bulle = $derived(
    !ennemi ? '' : etat === 'victoire' ? ennemi.defaite : etat === 'defaite' ? 'Ha ha ! Tu ne savais pas !' : etat === 'seconde' ? 'Raté ! … Hein ? Une banderole ?' : ennemi.replique,
  )
</script>

<div class="arene">
  <svg viewBox="0 0 400 230" role="img" aria-label={ennemi ? `Bataille contre ${ennemi.nom}` : 'Bataille'}>
    <rect width="400" height="230" fill={P.papier} />
    <rect y="190" width="400" height="40" fill={P.pierre} />
    {#each [40, 120, 200, 280, 360] as x (x)}<rect x={x - 12} y="208" width="24" height="3" fill={P.papier} />{/each}
    <g transform="translate(110,206) scale(1.15)">
      <Personnage teint={quartier.apparence.teint} coiffure={quartier.apparence.coiffure} equipe={quartier.equipe}
        pose={etat === 'victoire' ? 'victoire' : etat === 'defaite' ? 'sonne' : 'repos'} />
    </g>
    {#if ennemi}
      <g transform="translate(295,206) scale({ennemi.chef ? 1.3 : 1.15})">
        <DessinEnnemi dessin={ennemi.dessin} pose={etat === 'victoire' ? 'fuite' : 'menace'} />
      </g>
    {/if}
    {#if etat === 'victoire'}
      <g class="onomatopee" transform="translate(52,30)"><path d="M200,40 l14,10 l16,-8 l-2,18 l16,6 l-16,8 l4,18 l-16,-8 l-12,12 l-4,-16 l-18,-2 l12,-12 l-8,-16 Z" fill={P.lumiere} stroke={P.encre} stroke-width="2" />
        <text x="205" y="80" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="20" fill={P.rouge}>POUF !</text></g>
    {:else if etat === 'defaite'}
      <text class="onomatopee" x="110" y="30" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="22" fill={P.rouge} stroke={P.papier} stroke-width="3" paint-order="stroke">OUILLE !</text>
    {/if}
  </svg>
  {#if ennemi}
    <div class="bulle" class:chef={ennemi.chef}><b>{ennemi.nom}{ennemi.chef ? ' · chef' : ''}</b> « {bulle} »</div>
  {/if}
</div>

<style>
  .arene { position: relative; width: 100%; }
  svg { display: block; width: 100%; height: auto; border: 2px solid #1C1816; }
  /* La bulle est sous la scène, sa pointe tournée vers l'adversaire (à droite), pour ne pas le cacher. */
  .bulle {
    position: relative; margin: 12px 0 0 auto; width: fit-content; max-width: 85%; background: #fff; color: #1C1816; border: 2px solid #1C1816;
    border-radius: 12px; padding: 6px 10px; font-size: 14px; line-height: 1.35; font-family: var(--f-texte);
  }
  .bulle::before { content: ''; position: absolute; top: -10px; right: 22%; border: 9px solid transparent; border-top: 0; border-bottom: 10px solid #1C1816; }
  .bulle::after { content: ''; position: absolute; top: -7px; right: calc(22% + 2px); border: 7px solid transparent; border-top: 0; border-bottom: 8px solid #fff; }
  .bulle b { display: block; font-family: var(--f-interface); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #9E2B25; }
  .bulle.chef { border-color: #9E2B25; border-width: 3px; }
  .onomatopee { animation: surgit .4s ease-out; transform-box: fill-box; transform-origin: center; }
  @keyframes surgit { from { transform: scale(.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .onomatopee { animation: none; } }
</style>
