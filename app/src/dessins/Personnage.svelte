<script lang="ts">
  // Le personnage, équipé des objets gagnés en collectionnant les familles de cartes.
  // Origine du dessin : entre ses pieds, au sol. Poses : repos, victoire (bras levé), sonne (étoiles autour de la tête).
  import { P, TEINTS } from './palette'

  let { teint = 1, coiffure = 0, objets = {}, pose = 'repos' }:
    { teint?: number; coiffure?: number; objets?: Record<string, number>; pose?: 'repos' | 'victoire' | 'sonne' } = $props()

  const peau = $derived(TEINTS[teint] ?? TEINTS[1])
  const n = (f: string) => objets[f] ?? 0
  const bleu = '#2F4A6B'
  const sonne = $derived(pose === 'sonne')
  const victoire = $derived(pose === 'victoire')
</script>

<g transform={sonne ? 'rotate(-8)' : ''}>
  <!-- drapeau (courant de pensée), porté dans le dos -->
  {#if n('courant')}
    <rect x="9" y="-128" width="3" height="96" fill={P.encre} />
    <path d="M12,-127 L{40 + n('courant') * 6},-121 L{34 + n('courant') * 6},-111 L{40 + n('courant') * 6},-101 L12,-105 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" class="flotte" />
  {/if}
  <!-- banderole (événement), roulée dans le dos ; déployée dans la victoire -->
  {#if n('evenement') && !victoire}
    <rect x="-16" y="-80" width="34" height="9" rx="4" fill={P.rouge} stroke={P.encre} stroke-width="1.5" transform="rotate(-35 0 -76)" />
  {/if}

  <!-- jambes et chaussures -->
  <rect x="-11" y="-38" width="9" height="36" fill={P.encre} />
  <rect x="3" y="-38" width="9" height="36" fill={P.encre} />
  <rect x="-14" y="-4" width="13" height="5" rx="2" fill={P.encre} />
  <rect x="2" y="-4" width="13" height="5" rx="2" fill={P.encre} />
  <!-- veste de travail -->
  <path d="M-16,-38 L-14,-78 Q0,-84 14,-78 L16,-38 Z" fill={bleu} stroke={P.encre} stroke-width="1.5" />
  <line x1="0" y1="-80" x2="0" y2="-40" stroke={P.encre} stroke-width="1" />
  <!-- livre (livre), à la ceinture -->
  {#if n('livre')}
    <rect x="-24" y="-52" width="12" height="16" fill={n('livre') >= 3 ? P.rouge : P.encre} stroke={P.encre} stroke-width="1.5" />
    <rect x="-22" y="-50" width="2" height="12" fill={P.papier} />
  {/if}

  <!-- bras gauche (lanterne) -->
  <path d="M-14,-76 L-22,-48" stroke={bleu} stroke-width="8" stroke-linecap="round" />
  <circle cx="-22" cy="-46" r="4.5" fill={peau} />
  {#if n('lieu')}
    <line x1="-22" y1="-43" x2="-22" y2="-36" stroke={P.encre} stroke-width="1.5" />
    <rect x="-27" y="-36" width="10" height="13" fill={P.lumiere} stroke={P.encre} stroke-width="1.5" />
    {#if n('lieu') >= 2}<circle cx="-22" cy="-30" r={8 + n('lieu') * 3} fill={P.lumiere} opacity=".25" />{/if}
  {/if}

  <!-- bras droit : levé dans la victoire (avec le porte-voix ou la banderole) -->
  {#if victoire}
    <path d="M14,-76 L24,-104" stroke={bleu} stroke-width="8" stroke-linecap="round" />
    <circle cx="25" cy="-107" r="4.5" fill={peau} />
    {#if n('evenement')}
      <rect x="22" y="-150" width="3" height="46" fill={P.encre} />
      <rect x="25" y="-150" width={46 + n('evenement') * 6} height="20" fill={P.rouge} stroke={P.encre} stroke-width="1.5" class="flotte" />
      <text x={48 + n('evenement') * 3} y="-136" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="12" fill={P.papier}>VICTOIRE</text>
    {:else if n('chant')}
      <path d="M22,-110 L36,-124 L42,-114 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    {/if}
  {:else}
    <path d="M14,-76 L22,-48" stroke={bleu} stroke-width="8" stroke-linecap="round" />
    <circle cx="22" cy="-46" r="4.5" fill={peau} />
    {#if n('chant')}
      <!-- porte-voix (chant) -->
      <path d="M22,-50 L38,-60 L40,-44 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
      {#if n('chant') >= 2}<path d="M44,-58 q4,6 0,12 M48,-61 q6,9 0,18" fill="none" stroke={P.encre} stroke-width="1.5" />{/if}
    {/if}
  {/if}

  <!-- foulard rouge (personnalité) -->
  {#if n('personnalite')}
    <path d="M-9,-80 L9,-80 L0,{-66 - n('personnalite') * 2} Z" fill={P.rouge} stroke={P.encre} stroke-width="1" />
    {#if n('personnalite') >= 2}<path d="M6,-79 l{8 + n('personnalite') * 3},6 l-4,4 Z" fill={P.rouge} class="flotte" />{/if}
  {/if}

  <!-- tête -->
  <rect x="-4" y="-88" width="8" height="8" fill={peau} />
  <circle cx="0" cy="-98" r="12" fill={peau} stroke={P.encre} stroke-width="1.5" />
  <!-- coiffure : courte, longue, frisée -->
  {#if coiffure === 1}
    <path d="M-12,-100 Q-13,-114 0,-112 Q13,-114 12,-100 L13,-84 L8,-86 L9,-99 L-9,-99 L-8,-86 L-13,-84 Z" fill={P.encre} />
  {:else if coiffure === 2}
    {#each [-10, -5, 0, 5, 10] as x (x)}<circle cx={x} cy={-108 + Math.abs(x) * 0.25} r="5" fill={P.encre} />{/each}
  {:else}
    <path d="M-12,-100 Q-11,-112 0,-111 Q11,-112 12,-100 Q6,-105 0,-105 Q-6,-105 -12,-100 Z" fill={P.encre} />
  {/if}
  <!-- casquette d'ouvrier (mesure) -->
  {#if n('mesure')}
    <path d="M-13,-103 Q-12,-115 2,-114 Q14,-113 13,-103 Z" fill={n('mesure') >= 3 ? P.encre : P.grisFonce} stroke={P.encre} stroke-width="1.5" />
    <path d="M6,-104 L21,-101 L13,-99 Z" fill={P.encre} />
    {#if n('mesure') >= 2}<rect x="-12" y="-106" width="25" height="3" fill={P.rouge} />{/if}
  {/if}
  <!-- visage -->
  {#if sonne}
    <path d="M-7,-101 l4,4 m0,-4 l-4,4 M3,-101 l4,4 m0,-4 l-4,4" stroke={P.encre} stroke-width="1.6" />
    <ellipse cx="0" cy="-91" rx="3" ry="2" fill={P.encre} />
  {:else}
    <circle cx="-4.5" cy="-99" r="1.6" fill={P.encre} />
    <circle cx="4.5" cy="-99" r="1.6" fill={P.encre} />
    <path d={victoire ? 'M-5,-93 Q0,-87 5,-93' : 'M-4,-92 Q0,-90 4,-92'} fill="none" stroke={P.encre} stroke-width="1.5" />
  {/if}
  <!-- lunettes (concept) -->
  {#if n('concept') && !sonne}
    <circle cx="-4.5" cy="-99" r="4" fill="none" stroke={P.encre} stroke-width="1.5" />
    <circle cx="4.5" cy="-99" r="4" fill="none" stroke={P.encre} stroke-width="1.5" />
    <line x1="-0.5" y1="-99" x2="0.5" y2="-99" stroke={P.encre} stroke-width="1.5" />
  {/if}

  {#if sonne}
    <g class="etoiles" fill={P.lumiere} stroke={P.encre} stroke-width="1">
      {#each [[-18, -122], [0, -128], [18, -122]] as [x, y] (x)}
        <path d="M{x},{y - 6} l2,4 l4,1 l-3,3 l1,4 l-4,-2 l-4,2 l1,-4 l-3,-3 l4,-1 Z" />
      {/each}
    </g>
  {/if}
</g>

<style>
  .flotte { animation: flotte 1.6s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: left center; }
  .etoiles { animation: tourne 1.2s linear infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes flotte { from { transform: skewY(-4deg); } to { transform: skewY(4deg); } }
  @keyframes tourne { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .flotte, .etoiles { animation: none; } }
</style>
