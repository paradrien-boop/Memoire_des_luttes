<script lang="ts">
  // Les adversaires historiques, en caricatures d'époque (jamais des personnes réelles).
  // Origine : entre les pieds. Poses : menace (face au personnage, regard vers la gauche), fuite (il détale).
  import { P } from './palette'
  import { CADRES, premier } from './fichiers'

  let { dessin = 'soldat', pose = 'menace' }: { dessin?: string; pose?: 'menace' | 'fuite' } = $props()
  const gris = '#7C746C'
  const peau = '#E2C4A6'
  const fuite = $derived(pose === 'fuite')
  // Dessin déposé dans data/dessins/ennemis/ : il remplace le dessin en code.
  const fichier = $derived(premier(fuite ? [`ennemis/${dessin}-fuite`, `ennemis/${dessin}`] : [`ennemis/${dessin}`]))
  const C = CADRES.ennemis
</script>

<g class:fuite>
  {#if fichier}
    <image href={fichier} x={C.x} y={C.y} width={C.l} height={C.h} />
  {:else}
  <!-- jambes -->
  {#if dessin === 'soldat' || dessin === 'general'}
    <!-- pantalon rouge garance de l'armée de 1871 -->
    <rect x="-11" y="-40" width="9" height="38" fill="#9E2B25" stroke={P.encre} stroke-width="1" />
    <rect x="3" y="-40" width="9" height="38" fill="#9E2B25" stroke={P.encre} stroke-width="1" />
  {:else}
    <rect x="-11" y="-40" width="9" height="38" fill={P.encre} />
    <rect x="3" y="-40" width="9" height="38" fill={P.encre} />
  {/if}
  <rect x="-15" y="-4" width="13" height="5" rx="2" fill={P.encre} />
  <rect x="2" y="-4" width="13" height="5" rx="2" fill={P.encre} />

  <!-- corps -->
  {#if dessin === 'soldat' || dessin === 'general'}
    <path d="M-17,-40 L-15,-82 Q0,-88 15,-82 L17,-40 Z" fill="#2E3A5C" stroke={P.encre} stroke-width="1.5" />
    {#each [-70, -60, -50] as y (y)}<circle cx="-4" cy={y} r="1.6" fill={P.lumiere} />{/each}
    {#if dessin === 'general'}
      <rect x="-21" y="-84" width="12" height="5" fill={P.lumiere} stroke={P.encre} stroke-width="1" />
      <rect x="9" y="-84" width="12" height="5" fill={P.lumiere} stroke={P.encre} stroke-width="1" />
      {#each [4, 9] as x (x)}<circle cx={x} cy="-68" r="2.5" fill={P.lumiere} stroke={P.encre} stroke-width="1" />{/each}
    {/if}
  {:else if dessin === 'patron'}
    <!-- ventre rond, chaîne de montre en or -->
    <ellipse cx="0" cy="-58" rx="21" ry="24" fill={P.encre} />
    <path d="M-10,-58 Q0,-50 10,-58" fill="none" stroke={P.lumiere} stroke-width="1.5" />
  {:else if dessin === 'mouchard'}
    <!-- long imperméable -->
    <path d="M-16,-30 L-14,-82 Q0,-88 14,-82 L18,-30 Z" fill={gris} stroke={P.encre} stroke-width="1.5" />
    <line x1="2" y1="-82" x2="4" y2="-30" stroke={P.encre} stroke-width="1" />
  {:else}
    <path d="M-16,-40 L-14,-82 Q0,-88 14,-82 L16,-40 Z" fill={P.encre} stroke={P.encre} stroke-width="1.5" />
    <rect x="-3" y="-82" width="6" height="12" fill={P.papier} />
  {/if}

  <!-- bras et accessoire -->
  {#if dessin === 'proprietaire'}
    <path d="M-14,-78 L-26,-60" stroke={P.encre} stroke-width="7" stroke-linecap="round" />
    <!-- registre des loyers -->
    <rect x="-40" y="-70" width="18" height="22" fill={P.papier} stroke={P.encre} stroke-width="1.5" />
    <text x="-31" y="-56" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="6.5" fill={P.rouge}>LOYERS</text>
    <path d="M14,-78 L22,-52" stroke={P.encre} stroke-width="7" stroke-linecap="round" />
    <!-- trousseau de clés -->
    <circle cx="23" cy="-47" r="5" fill="none" stroke={P.lumiere} stroke-width="2" />
    <path d="M26,-44 l6,6 m-3,-3 l3,-1" stroke={P.lumiere} stroke-width="2" />
  {:else if dessin === 'censeur'}
    <path d="M-14,-78 L-28,-74" stroke={P.encre} stroke-width="7" stroke-linecap="round" />
    <!-- ciseaux géants -->
    <g transform="translate(-40,-74) rotate(-20)" stroke={P.encre} stroke-width="2">
      <circle cx="10" cy="-4" r="4" fill="none" /><circle cx="10" cy="5" r="4" fill="none" />
      <path d="M6,-2 L-18,-8 M6,3 L-18,8" stroke-width="3" />
    </g>
    <path d="M14,-78 L20,-52" stroke={P.encre} stroke-width="7" stroke-linecap="round" />
  {:else if dessin === 'mouchard'}
    <path d="M-14,-78 L-24,-62" stroke={gris} stroke-width="7" stroke-linecap="round" />
    <!-- carnet de délation -->
    <rect x="-34" y="-68" width="11" height="15" fill={P.papier} stroke={P.encre} stroke-width="1.5" />
    <path d="M14,-78 L18,-50" stroke={gris} stroke-width="7" stroke-linecap="round" />
  {:else}
    <!-- doigt pointé : « Halte-là ! » -->
    <path d="M-14,-78 L-32,-72" stroke={dessin === 'patron' ? P.encre : '#2E3A5C'} stroke-width="7" stroke-linecap="round" />
    <circle cx="-34" cy="-72" r="3.5" fill={peau} />
    <path d="M14,-78 L20,-52" stroke={dessin === 'patron' ? P.encre : '#2E3A5C'} stroke-width="7" stroke-linecap="round" />
    {#if dessin === 'patron'}<rect x="-6" y="-97" width="11" height="2.5" fill="#8A5A2B" /><circle cx="-6" cy="-96" r="1.5" fill={P.rouge} />{/if}
  {/if}

  <!-- tête -->
  <circle cx="0" cy="-98" r="12" fill={peau} stroke={P.encre} stroke-width="1.5" />
  <!-- yeux méchants, tournés vers le personnage (à gauche) -->
  {#if fuite}
    <circle cx="-4" cy="-100" r="2.5" fill="#fff" stroke={P.encre} /><circle cx="4" cy="-100" r="2.5" fill="#fff" stroke={P.encre} />
    <ellipse cx="0" cy="-91" rx="3" ry="3.5" fill={P.encre} />
  {:else}
    <path d="M-8,-104 L-2,-102 M8,-104 L2,-102" stroke={P.encre} stroke-width="1.8" />
    <circle cx="-6" cy="-99" r="1.5" fill={P.encre} /><circle cx="2" cy="-99" r="1.5" fill={P.encre} />
    <path d="M-6,-91 Q-1,-94 4,-91" fill="none" stroke={P.encre} stroke-width="1.5" />
  {/if}
  <!-- moustaches -->
  {#if dessin !== 'mouchard'}
    <path d="M-1,-94 q-8,-1 -12,4 q6,-2 12,-1 q6,-1 12,1 q-4,-5 -12,-4" fill={dessin === 'general' ? '#D8D2C8' : P.encre} />
  {/if}

  <!-- couvre-chef -->
  {#if dessin === 'soldat'}
    <!-- képi rouge et bleu -->
    <path d="M-10,-106 L-9,-120 L9,-120 L10,-106 Z" fill="#9E2B25" stroke={P.encre} stroke-width="1.5" />
    <rect x="-11" y="-108" width="22" height="4" fill="#2E3A5C" />
    <path d="M-12,-105 L-18,-102 L-6,-103 Z" fill={P.encre} />
  {:else if dessin === 'general'}
    <!-- bicorne à plumet -->
    <path d="M-22,-106 Q0,-130 22,-106 Q0,-112 -22,-106 Z" fill={P.encre} />
    <circle cx="0" cy="-114" r="3" fill={P.lumiere} />
    <path d="M2,-118 q6,-12 2,-18 q8,6 2,18" fill="#F2F2F2" stroke={P.encre} stroke-width="1" />
  {:else if dessin === 'patron'}
    <!-- haut-de-forme -->
    <rect x="-10" y="-130" width="20" height="22" fill={P.encre} />
    <rect x="-15" y="-109" width="30" height="4" fill={P.encre} />
    <rect x="-10" y="-114" width="20" height="3" fill={P.rouge} />
  {:else if dessin === 'proprietaire'}
    <!-- chapeau melon -->
    <path d="M-11,-106 Q-11,-122 0,-122 Q11,-122 11,-106 Z" fill={P.encre} />
    <rect x="-15" y="-107" width="30" height="3" rx="1.5" fill={P.encre} />
  {:else if dessin === 'mouchard'}
    <!-- chapeau rabattu sur les yeux -->
    <path d="M-17,-103 Q0,-110 17,-103 L12,-106 Q12,-120 0,-120 Q-12,-120 -12,-106 Z" fill="#4A443E" stroke={P.encre} stroke-width="1" />
  {:else}
    <!-- censeur : toque noire -->
    <rect x="-11" y="-118" width="22" height="12" fill={P.encre} />
  {/if}

  {#if fuite}
    <!-- nuage de poussière cartoon -->
    <g class="pouf" fill={P.papier} stroke={P.encre} stroke-width="1.5">
      <circle cx="30" cy="-10" r="10" /><circle cx="44" cy="-14" r="13" /><circle cx="58" cy="-8" r="9" />
    </g>
  {/if}
  {/if}
</g>

<style>
  .fuite { animation: detale .9s ease-in forwards; transform-box: fill-box; }
  @keyframes detale { 0% { transform: translateX(0) rotate(0); } 25% { transform: translateX(-8px) rotate(-6deg); } 100% { transform: translateX(170px) rotate(12deg); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .fuite { animation: none; opacity: .25; } }
</style>
