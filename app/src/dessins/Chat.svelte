<script lang="ts">
  // Le chat noir, en 5 stades. Origine du dessin : entre ses pattes, au sol.
  // 0 chaton des rues · 1 chat de gouttière · 2 chat de grève (hérissé) · 3 chat de barricade (écharpe) · 4 chat sauvage (dos rond)
  import { P } from './palette'
  import { CADRES, premier } from './fichiers'

  let { stade = 0, dort = false, accessoires = [], pancarte = false }:
    { stade?: number; dort?: boolean; accessoires?: string[]; pancarte?: boolean } = $props()

  const assis = $derived(stade <= 1)
  const echelle = $derived([0.72, 0.95, 0.85, 0.95, 1.05][stade] ?? 1)
  const a = (nom: string) => accessoires.includes(nom)
  // Dessin déposé dans data/dessins/chat/ : il remplace le corps du chat (pancarte, notes et « z » restent).
  const fichier = $derived(premier(dort ? [`chat/stade-${stade}-endormi`, `chat/stade-${stade}`] : [`chat/stade-${stade}`]))
  const C = CADRES.chat
</script>

<g transform="scale({echelle})">
  {#if pancarte}
    <!-- Jour de manif : le chat porte une pancarte -->
    <g transform="translate({assis ? 30 : 46},0)">
      <rect x="-2" y="-96" width="4" height="96" fill={P.encre} />
      <rect x="-34" y="-118" width="68" height="34" fill={P.papier} stroke={P.encre} stroke-width="3" />
      <text x="0" y="-95" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="16" fill={P.rouge}>EN LUTTE</text>
    </g>
  {/if}

  {#if fichier}
    <!-- le cadre du gabarit est à l'échelle 1 : on annule l'échelle du stade -->
    <g transform="scale({1 / echelle})"><image href={fichier} x={C.x} y={C.y} width={C.l} height={C.h} /></g>
  {:else}
    {#if assis}
      <!-- Assis : chaton, puis chat de gouttière -->
      <path d={stade === 0 ? 'M14,-4 C30,-2 30,-22 22,-30' : 'M18,-4 C44,-2 46,-34 30,-44'} fill="none" stroke={P.encre} stroke-width={stade === 0 ? 4 : 6} stroke-linecap="round" />
      <ellipse cx="0" cy="-22" rx={stade === 0 ? 16 : 20} ry="24" fill={P.encre} />
      <circle cx="0" cy="-52" r={stade === 0 ? 14 : 15} fill={P.encre} />
      <polygon points={stade === 0 ? '-13,-56 -12,-70 -3,-63' : '-13,-58 -9,-75 -1,-64'} fill={P.encre} />
      <polygon points={stade === 0 ? '13,-56 12,-70 3,-63' : '13,-58 9,-75 1,-64'} fill={P.encre} />
      {#if dort}
        <path d="M-9,-53 q4,3 8,0 M1,-53 q4,3 8,0" fill="none" stroke={P.oeil} stroke-width="2" stroke-linecap="round" />
      {:else}
        <ellipse cx="-5.5" cy="-54" rx={stade === 0 ? 4 : 3.5} ry={stade === 0 ? 4.5 : 4} fill={P.oeil} />
        <ellipse cx="5.5" cy="-54" rx={stade === 0 ? 4 : 3.5} ry={stade === 0 ? 4.5 : 4} fill={P.oeil} />
        <ellipse cx="-5.5" cy="-54" rx="1.2" ry="3" fill={P.encre} />
        <ellipse cx="5.5" cy="-54" rx="1.2" ry="3" fill={P.encre} />
      {/if}
      <ellipse cx="-7" cy="-2" rx="6" ry="3.5" fill={P.encre} />
      <ellipse cx="7" cy="-2" rx="6" ry="3.5" fill={P.encre} />
      {#if a('foulard')}<path d="M-12,-40 Q0,-33 12,-40 L10,-35 Q0,-29 -10,-35 Z M2,-34 l6,12 l4,-10 Z" fill={P.rouge} />{/if}
      {#if a('cocarde')}<circle cx="-8" cy="-30" r="5" fill={P.rouge} /><circle cx="-8" cy="-30" r="2.2" fill={P.papier} />{/if}
    {:else}
      <!-- Debout, de profil : chat de grève, de barricade, puis chat sauvage -->
      {@const sauvage = stade === 4}
      <!-- queue -->
      {#if sauvage}
        <path d="M28,-36 L34,-84" stroke={P.encre} stroke-width="8" stroke-linecap="round" />
        <path d="M26,-50 l-6,-3 M38,-50 l6,-3 M27,-62 l-6,-3 M37,-62 l6,-3 M29,-74 l-5,-3 M36,-74 l5,-3" stroke={P.encre} stroke-width="3" stroke-linecap="round" />
      {:else}
        <path d="M32,-30 C52,-38 50,-62 40,-70" fill="none" stroke={P.encre} stroke-width="7" stroke-linecap="round" />
      {/if}
      <!-- pattes -->
      {#each [-27, -17, 15, 25] as x (x)}<rect x={x - 3} y={sauvage ? -26 : -22} width="6" height={sauvage ? 26 : 22} rx="2" fill={P.encre} />{/each}
      {#if sauvage}
        <path d="M-30,0 l-3,3 M-27,0 l0,4 M-24,0 l3,3 M-20,0 l-3,3 M-17,0 l0,4 M-14,0 l3,3" stroke={P.papier} stroke-width="1.5" />
      {/if}
      <!-- corps -->
      {#if sauvage}
        <path d="M-32,-22 C-30,-66 26,-68 32,-24 L28,-16 L-28,-16 Z" fill={P.encre} />
        <!-- poil hérissé le long du dos rond -->
        <path d="M-28,-40 l-6,-6 l8,1 l-2,-9 l7,5 l1,-10 l6,8 l4,-9 l4,9 l6,-8 l1,10 l7,-5 l-2,9 l8,-1 l-6,6" fill={P.encre} />
      {:else}
        <ellipse cx="0" cy="-30" rx="34" ry="15" fill={P.encre} />
        <!-- poil hérissé -->
        <path d="M-22,-42 l2,-9 l4,7 l3,-9 l4,8 l3,-9 l4,8 l3,-9 l4,8 l3,-8 l3,8 l3,-7 l2,8" fill={P.encre} />
      {/if}
      <!-- tête -->
      <g transform="translate({sauvage ? -36 : -38},{sauvage ? -34 : -40})">
        <circle r="13" fill={P.encre} />
        <polygon points="-11,-5 -12,-22 -2,-12" fill={P.encre} />
        <polygon points="3,-12 9,-24 11,-6" fill={P.encre} />
        {#if dort}
          <path d="M-9,-2 q4,3 8,0" fill="none" stroke={P.oeil} stroke-width="2" stroke-linecap="round" />
        {:else}
          <!-- regard décidé : œil plissé -->
          <path d="M-10,-4 L-1,-2 L-3,1 L-10,0 Z" fill={P.oeil} />
          <circle cx="-5" cy="-1.5" r="1.3" fill={P.encre} />
        {/if}
        {#if sauvage && !dort}
          <!-- gueule ouverte, crocs -->
          <path d="M-13,4 L-3,6 L-12,10 Z" fill={P.rouge} />
          <path d="M-11,4 l1,3 l1,-3 M-7,5 l1,3 l1,-3" fill={P.papier} />
        {/if}
        <path d="M-13,3 l-9,-2 M-13,5 l-9,2" stroke={P.grisFonce} stroke-width="1" />
      </g>
      <!-- écharpe rouge dès le chat de barricade, qui flotte au vent -->
      {#if stade >= 3 || a('foulard')}
        <path d="M-30,-44 Q-24,-30 -16,-40 L-18,-34 Q-26,-24 -32,-38 Z" fill={P.rouge} />
        <path d="M-18,-37 C-6,-36 2,-48 14,-44 C6,-40 0,-30 -16,-33 Z" fill={P.rouge} />
      {/if}
      {#if a('cocarde')}<circle cx="-22" cy="-28" r="5" fill={P.rouge} /><circle cx="-22" cy="-28" r="2.2" fill={P.papier} />{/if}
    {/if}
  {/if}

  {#if a('partition') && !dort}
    <g fill={P.encre} transform="translate({assis ? -30 : -60},{assis ? -78 : -78})">
      <ellipse cx="0" cy="0" rx="4" ry="3" /><rect x="3" y="-14" width="1.6" height="14" />
      <ellipse cx="12" cy="-6" rx="4" ry="3" /><rect x="15" y="-20" width="1.6" height="14" /><rect x="3" y="-14" width="13.6" height="2.5" transform="rotate(-24 3 -14)" />
    </g>
  {/if}

  {#if dort}
    <g font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" fill={P.rouge} stroke={P.papier} stroke-width="3" paint-order="stroke">
      <text x={assis ? 16 : -18} y={assis ? -70 : -66} font-size="15">z</text>
      <text x={assis ? 26 : -8} y={assis ? -84 : -80} font-size="20">z</text>
    </g>
  {/if}
</g>
