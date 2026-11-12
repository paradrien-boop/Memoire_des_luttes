<script lang="ts">
  // Le quartier du chat. Chaque famille de cartes construit un élément, en 3 niveaux :
  // 1 esquissé, 2 construit, 3 animé. Au départ, la rue est grise et vide.
  import Chat from './Chat.svelte'
  import Personnage from './Personnage.svelte'
  import { P } from './palette'

  let { niveaux = {}, stade = 0, dort = false, accessoires = [], pancarte = false, description = '', personnage = null, foule = 0, heure = new Date().getHours() }:
    {
      niveaux?: Record<string, number>; stade?: number; dort?: boolean; accessoires?: string[]; pancarte?: boolean; description?: string
      /** Le personnage du joueur ou de la joueuse, à côté du chat. */
      personnage?: { teint: number; coiffure: number; objets: Record<string, number> } | null
      /** Nombre de passants (les jours de manif remplissent le quartier). */
      foule?: number
      /** Heure réelle : la nuit tombe dans le quartier. */
      heure?: number
    } = $props()
  const nuit = $derived(heure >= 20 || heure < 7)
  /** Passants : position de départ, durée de la traversée, sens, couleur du manteau. */
  const PASSANTS = [[0, 26, 1, '#2F4A6B'], [140, 31, -1, '#5B3A4A'], [260, 23, 1, '#3E5A3A'], [80, 35, -1, '#6B4E2E'], [320, 28, 1, '#444'], [200, 33, -1, '#7A2A22']] as const

  const n = (fam: string) => niveaux[fam] ?? 0
  // Plus le quartier se construit, plus il y a de fenêtres allumées.
  const vie = $derived(Object.values(niveaux).reduce((t, x) => t + x, 0))
  const F = 'Big Shoulders Display, Impact, sans-serif'

  // Fenêtres des trois immeubles : [x, y]
  const fenetres: [number, number][] = [
    [18, 52], [48, 52], [78, 52], [18, 82], [78, 82],
    [140, 86], [170, 86], [200, 86], [230, 86], [140, 118], [230, 118],
    [292, 70], [322, 70], [352, 70], [292, 104], [322, 104], [352, 104], [292, 138], [352, 138],
  ]
  // Ordre dans lequel les fenêtres s'allument (pour que ce soit réparti)
  const ordre = [5, 12, 1, 16, 8, 3, 14, 10, 0, 18, 6, 13, 2, 9, 17, 4, 11, 15, 7]
</script>

<svg viewBox="0 0 400 300" role="img" aria-label={description}>
  <defs>
    <pattern id="trame" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.3" fill={P.rougeClair} opacity=".55" /></pattern>
    <pattern id="trame-grise" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill={P.grisFonce} opacity=".5" /></pattern>
  </defs>

  <!-- ciel (la nuit tombe selon l'heure réelle) -->
  <rect width="400" height="300" fill={nuit ? '#232A3B' : P.papier} />
  {#if nuit}
    {#each [[30, 14], [90, 30], [150, 10], [250, 22], [330, 12], [372, 34], [205, 6]] as [x, y], i (i)}
      <circle cx={x} cy={y} r="1.6" fill="#F4EBD0" class="scintille" style="animation-delay:{i * 0.4}s" />
    {/each}
    <circle cx="350" cy="26" r="11" fill="#F4EBD0" /><circle cx="355" cy="22" r="10" fill="#232A3B" />
  {:else}
    <rect width="400" height="60" fill="url(#trame)" />
    <!-- pigeons qui traversent le ciel -->
    {#each [[0, 18, 0], [1, 26, 7]] as [i, y, retard] (i)}
      <g class="pigeon" style="animation-delay:{retard}s">
        <path d="M0,{y} q5,-6 10,0 q5,-6 10,0" fill="none" stroke={P.encre} stroke-width="2" stroke-linecap="round" />
      </g>
    {/each}
  {/if}
  <!-- fumée de cheminée -->
  <rect x="236" y="-2" width="10" height="14" fill={P.encre} />
  {#each [0, 1, 2] as i (i)}<circle cx="241" cy="-6" r="5" fill={nuit ? '#5A6072' : '#BDB5AB'} class="fumee" style="animation-delay:{i * 1.3}s" />{/each}

  <!-- immeubles -->
  <rect x="4" y="34" width="114" height="200" fill={P.gris} stroke={P.encre} stroke-width="2.5" />
  <rect x="124" y="16" width="148" height="218" fill={P.pierre} stroke={P.encre} stroke-width="2.5" />
  <polygon points="124,16 198,0 272,16" fill={P.encre} />
  <rect x="278" y="50" width="118" height="184" fill={P.gris} stroke={P.encre} stroke-width="2.5" />
  <rect x="278" y="50" width="118" height="184" fill="url(#trame-grise)" />

  <!-- fenêtres, allumées selon la vie du quartier -->
  {#each fenetres as [x, y], i (i)}
    <rect {x} {y} width="20" height="22" fill={ordre.indexOf(i) < vie + (nuit ? 3 : 0) ? P.lumiere : P.encre} stroke={P.encre} stroke-width="2" />
  {/each}

  <!-- PERSONNALITÉ : fresque murale sur le mur de gauche -->
  {#if n('personnalite') === 1}
    <rect x="12" y="112" width="96" height="70" fill="none" stroke={P.encre} stroke-width="1.5" stroke-dasharray="4 4" />
    <circle cx="60" cy="138" r="10" fill="none" stroke={P.encre} stroke-width="1.5" stroke-dasharray="3 3" />
  {:else if n('personnalite') >= 2}
    <rect x="12" y="112" width="96" height="70" fill={P.rouge} stroke={P.encre} stroke-width="2" />
    {#each [32, 60, 88] as x (x)}
      <circle cx={x} cy="138" r="9" fill={P.papier} />
      <path d="M{x - 14},182 C{x - 14},158 {x + 14},158 {x + 14},182 Z" fill={P.papier} />
    {/each}
    {#if n('personnalite') >= 3}
      <rect x="12" y="112" width="96" height="70" fill="none" stroke={P.lumiere} stroke-width="3" />
      <text x="60" y="126" text-anchor="middle" font-family={F} font-weight="900" font-size="9" fill={P.papier}>NOS MÉMOIRES</text>
    {/if}
  {/if}

  <!-- CONCEPT : atelier coopératif au rez-de-chaussée de gauche -->
  {#if n('concept') === 0}
    <rect x="18" y="194" width="84" height="40" fill={P.grisFonce} stroke={P.encre} stroke-width="2" />
    {#each [202, 210, 218, 226] as y (y)}<line x1="18" y1={y} x2="102" y2={y} stroke={P.encre} stroke-width="1" />{/each}
  {:else}
    <rect x="18" y="194" width="84" height="40" fill={n('concept') >= 2 ? P.lumiere : P.grisFonce} stroke={P.encre} stroke-width="2" />
    {#if n('concept') === 1}
      {#each [202, 210] as y (y)}<line x1="18" y1={y} x2="102" y2={y} stroke={P.encre} stroke-width="1" />{/each}
    {:else}
      <!-- établi et engrenage -->
      <rect x="28" y="218" width="40" height="5" fill={P.encre} /><rect x="30" y="223" width="3" height="11" fill={P.encre} /><rect x="63" y="223" width="3" height="11" fill={P.encre} />
      <circle cx="84" cy="212" r="8" fill="none" stroke={P.encre} stroke-width="4" stroke-dasharray="3 2.3" /><circle cx="84" cy="212" r="3" fill={P.encre} />
    {/if}
    {#if n('concept') >= 3}
      <rect x="30" y="184" width="60" height="12" fill={P.encre} />
      <text x="60" y="194" text-anchor="middle" font-family={F} font-weight="900" font-size="10" fill={P.lumiere}>COOPÉRATIVE</text>
    {/if}
  {/if}

  <!-- MESURE : la Bourse du travail, au centre -->
  {#if n('mesure') === 1}
    <!-- échafaudage -->
    {#each [130, 166, 202, 238, 266] as x (x)}<line x1={x} y1="24" x2={x} y2="78" stroke={P.encre} stroke-width="1.5" />{/each}
    <line x1="128" y1="40" x2="268" y2="40" stroke={P.encre} stroke-width="1.5" /><line x1="128" y1="62" x2="268" y2="62" stroke={P.encre} stroke-width="1.5" />
  {:else if n('mesure') >= 2}
    <rect x="134" y="34" width="128" height="24" fill={P.encre} />
    <text x="198" y="51" text-anchor="middle" font-family={F} font-weight="900" font-size="14" letter-spacing=".5" fill={P.papier}>BOURSE DU TRAVAIL</text>
  {/if}
  <!-- porte de la Bourse -->
  <path d="M176,234 L176,176 Q198,156 220,176 L220,234 Z" fill={n('mesure') >= 3 ? P.lumiere : P.encre} stroke={P.encre} stroke-width="2.5" />
  {#if n('mesure') >= 3}
    {#each [188, 208] as x (x)}<circle cx={x} cy="204" r="5" fill={P.encre} /><rect x={x - 5} y="209" width="10" height="25" rx="4" fill={P.encre} />{/each}
  {/if}

  <!-- LIEU : plaque, puis monument fleuri -->
  {#if n('lieu') >= 1}
    <rect x="228" y="182" width="34" height="22" fill={n('lieu') >= 2 ? P.papier : P.gris} stroke={P.encre} stroke-width="2" />
    {#if n('lieu') >= 2}
      <line x1="233" y1="189" x2="257" y2="189" stroke={P.encre} stroke-width="1.5" /><line x1="233" y1="194" x2="257" y2="194" stroke={P.encre} stroke-width="1.5" /><line x1="236" y1="199" x2="254" y2="199" stroke={P.encre} stroke-width="1.5" />
    {/if}
    {#if n('lieu') >= 3}
      {#each [232, 240, 248, 256] as x, i (x)}<line x1={x} y1="234" x2={x} y2="222" stroke={P.encre} stroke-width="1.5" /><circle cx={x} cy={220 - (i % 2) * 3} r="3.5" fill={P.rouge} />{/each}
    {/if}
  {/if}

  <!-- COURANT : mur d'affiches -->
  {#each [[134, 148, 'rouge'], [152, 140, 'papier'], [138, 170, 'papier'], [156, 162, 'rouge']] as [x, y, c], i (i)}
    {#if n('courant') >= [1, 2, 2, 3][i]}
      <rect x={x as number} y={y as number} width="16" height="22" fill={c === 'rouge' ? P.rouge : P.papier} stroke={P.encre} stroke-width="1.5" transform="rotate({i % 2 ? 4 : -3} {(x as number) + 8} {(y as number) + 11})" />
      <line x1={(x as number) + 3} y1={(y as number) + 6} x2={(x as number) + 13} y2={(y as number) + 6} stroke={P.encre} stroke-width="2" />
    {/if}
  {/each}

  <!-- LIVRE : bibliothèque populaire au rez-de-chaussée de droite -->
  {#if n('livre') === 0}
    <rect x="286" y="168" width="102" height="66" fill={P.grisFonce} stroke={P.encre} stroke-width="2" />
    <line x1="286" y1="168" x2="388" y2="234" stroke={P.encre} stroke-width="2" /><line x1="388" y1="168" x2="286" y2="234" stroke={P.encre} stroke-width="2" />
  {:else}
    <rect x="286" y="168" width="102" height="66" fill={n('livre') >= 2 ? P.lumiere : P.papier} stroke={P.encre} stroke-width="2" />
    {#if n('livre') >= 2}
      {#each [[292, 'encre'], [298, 'rouge'], [303, 'encre'], [309, 'grisFonce'], [314, 'rouge'], [320, 'encre'], [354, 'rouge'], [360, 'encre'], [366, 'grisFonce'], [371, 'rouge'], [377, 'encre']] as [x, c], i (i)}
        <rect x={x as number} y={198 - (i % 3) * 2} width="5" height={20 + (i % 3) * 2} fill={P[c as 'encre']} />
      {/each}
      <rect x="290" y="218" width="94" height="3" fill={P.encre} />
      <rect x="296" y="156" width="82" height="13" fill={P.encre} />
      <text x="337" y="166" text-anchor="middle" font-family={F} font-weight="900" font-size="10" fill={P.papier}>BIBLIOTHÈQUE</text>
    {:else}
      <line x1="300" y1="190" x2="374" y2="190" stroke={P.encre} stroke-width="1.5" stroke-dasharray="4 4" />
    {/if}
  {/if}

  <!-- trottoir et chaussée -->
  <rect x="0" y="234" width="400" height="14" fill={P.gris} stroke={P.encre} stroke-width="2" />
  <rect x="0" y="248" width="400" height="52" fill={P.pierre} />
  {#each [20, 80, 140, 200, 260, 320, 380] as x (x)}<rect x={x - 14} y="272" width="28" height="4" fill={P.papier} />{/each}

  {#if n('livre') >= 3}
    <!-- boîte de bouquiniste sur le trottoir -->
    <rect x="276" y="226" width="38" height="12" fill={P.rouge} stroke={P.encre} stroke-width="2" />
    <rect x="280" y="220" width="4" height="7" fill={P.encre} /><rect x="286" y="221" width="4" height="6" fill={P.papier} stroke={P.encre} /><rect x="292" y="219" width="4" height="8" fill={P.encre} />
  {/if}

  <!-- ÉVÉNEMENT : corde, puis banderole, puis barricade -->
  {#if n('evenement') >= 1}
    <path d="M118,92 Q198,{n('evenement') >= 2 ? 104 : 112} 278,92" fill="none" stroke={P.encre} stroke-width="1.5" />
  {/if}
  {#if n('evenement') >= 2}
    <path d="M136,96 L260,96 L258,120 L138,120 Z" fill={P.rouge} stroke={P.encre} stroke-width="2" />
    <text x="198" y="113" text-anchor="middle" font-family={F} font-weight="900" font-size="14" fill={P.papier}>VIVE LA COMMUNE</text>
  {/if}
  {#if n('evenement') >= 3}
    <g stroke={P.encre} stroke-width="1.5">
      {#each [[8, 262], [30, 262], [52, 262], [74, 262], [96, 262], [18, 248], [40, 248], [62, 248], [84, 248], [28, 234], [50, 234], [72, 234]] as [x, y], i (i)}
        <rect {x} {y} width="22" height="14" fill={i % 4 === 0 ? P.grisFonce : P.gris} />
      {/each}
    </g>
    <rect x="108" y="206" width="3" height="70" fill={P.encre} />
    <path d="M111,208 L144,214 L138,224 L144,234 L111,230 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
  {/if}

  <!-- CHANT : réverbère, puis kiosque à musique, puis chorale -->
  {#if n('chant') >= 1}
    <rect x="391" y="190" width="4" height="96" fill={P.encre} />
    <path d="M385,190 L400,190 L397,178 L389,178 Z" fill={n('chant') >= 2 ? P.lumiere : P.grisFonce} stroke={P.encre} stroke-width="1.5" />
  {/if}
  {#if n('chant') >= 2}
    <g transform="translate(352,290) scale(.85)">
      <rect x="-34" y="-10" width="68" height="10" fill={P.encre} />
      {#each [-28, -10, 10, 28] as x (x)}<rect x={x - 1.5} y="-48" width="3" height="38" fill={P.encre} />{/each}
      <path d="M-40,-48 L0,-70 L40,-48 Z" fill={P.rouge} stroke={P.encre} stroke-width="2" />
      {#if n('chant') >= 3}
        {#each [-18, 0, 18] as x (x)}<circle cx={x} cy="-28" r="5" fill={P.encre} /><rect x={x - 5} y="-23" width="10" height="13" rx="3" fill={P.encre} />{/each}
        <g fill={P.encre}><ellipse cx="-30" cy="-82" rx="4" ry="3" /><rect x="-27" y="-96" width="1.6" height="14" /><ellipse cx="26" cy="-88" rx="4" ry="3" /><rect x="29" y="-102" width="1.6" height="14" /></g>
      {/if}
    </g>
  {/if}

  <!-- passants sur le trottoir : un de plus à chaque jour de manif -->
  {#each PASSANTS.slice(0, foule) as [depart, duree, sens, manteau], i (i)}
    <g class="passant" style="--x:{depart}px; animation-duration:{duree}s; animation-delay:-{depart / 400 * duree}s; animation-direction:{sens > 0 ? 'normal' : 'reverse'}">
      <g class="pas">
        <circle cx="0" cy="-36" r="5" fill="#C9A27E" stroke={P.encre} />
        <rect x="-5" y="-31" width="10" height="17" rx="3" fill={manteau} />
        <rect x="-4" y="-14" width="3" height="12" fill={P.encre} /><rect x="1" y="-14" width="3" height="12" fill={P.encre} />
      </g>
    </g>
  {/each}

  <!-- le personnage, à côté du chat -->
  {#if personnage}
    <g transform="translate(140,288) scale(.62)">
      <Personnage teint={personnage.teint} coiffure={personnage.coiffure} objets={personnage.objets} pose={pancarte ? 'victoire' : 'repos'} />
    </g>
  {/if}

  <!-- le chat -->
  <g transform="translate(200,284)">
    <ellipse cx="0" cy="0" rx="40" ry="5" fill={P.encre} opacity=".18" />
    <Chat {stade} {dort} {accessoires} {pancarte} />
  </g>
</svg>

<style>
  /* La vie du quartier, en continu. Tout s'arrête si le téléphone demande moins d'animations. */
  .pigeon { animation: vole 16s linear infinite; }
  @keyframes vole { from { transform: translateX(-40px); } to { transform: translateX(440px); } }
  .fumee { animation: fumee 4s ease-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
  @keyframes fumee { 0% { transform: translate(0, 0) scale(.6); opacity: .8; } 100% { transform: translate(14px, -26px) scale(1.8); opacity: 0; } }
  .scintille { animation: scintille 2.4s ease-in-out infinite alternate; }
  @keyframes scintille { from { opacity: .35; } to { opacity: 1; } }
  .passant { animation: marche linear infinite; }
  @keyframes marche { from { transform: translate(-20px, 247px); } to { transform: translate(420px, 247px); } }
  .pas { animation: balance .5s ease-in-out infinite alternate; }
  @keyframes balance { from { transform: translateY(0); } to { transform: translateY(-1.5px); } }
  @media (prefers-reduced-motion: reduce) {
    .pigeon, .fumee, .scintille, .passant, .pas { animation: none; }
    .fumee { opacity: .5; }
    .passant { transform: translate(var(--x), 247px); }
  }
  svg { display: block; width: 100%; height: auto; border: 2px solid #1C1816; background: #EDE8E0; }
</style>
