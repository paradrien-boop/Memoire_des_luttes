<script lang="ts">
  // Le personnage et son équipement, emplacement par emplacement (tête, visage, col, haut, mains, dos).
  // Origine du dessin : entre ses pieds, au sol. Poses : repos, victoire (bras droit levé), sonne (étoiles).
  import type { Equipe } from '@mdl/noyau'
  import { P, TEINTS } from './palette'
  import { CADRES, premier } from './fichiers.svelte'

  let { teint = 1, coiffure = 0, equipe = {}, pose = 'repos', corps = true }:
    {
      teint?: number; coiffure?: number; equipe?: Equipe; pose?: 'repos' | 'victoire' | 'sonne'
      /** false : seulement les objets, sans le corps (pour exporter les modèles de dessins). */
      corps?: boolean
    } = $props()

  // teint -1 : la couleur repère (magenta), utilisée pour exporter les modèles de dessins.
  const peau = $derived(teint === -1 ? '#FF00FF' : (TEINTS[teint] ?? TEINTS[1]))
  const sonne = $derived(pose === 'sonne')
  const victoire = $derived(pose === 'victoire')
  const haut = $derived(equipe.haut ?? null)
  const veste = $derived(haut === 'bleu-de-chauffe' ? '#22364F' : haut === 'mariniere' ? '#F4F1EA' : '#2F4A6B')
  const manche = $derived(haut === 'mariniere' ? '#F4F1EA' : veste)
  /** Main droite : au repos le long du corps, levée dans la victoire. */
  const md = $derived(victoire ? { x: 25, y: -107 } : { x: 22, y: -46 })
  const mg = { x: -22, y: -46 }
  const F = 'Big Shoulders Display, Impact, sans-serif'

  // Dessins déposés dans data/dessins/personnage/ : ils remplacent le dessin en code, emplacement par emplacement.
  const C = CADRES.personnage
  const base = $derived(premier(pose === 'repos' ? [`personnage/base-${coiffure}`] : [`personnage/base-${coiffure}-${pose}`, `personnage/base-${coiffure}`], peau))
  /** Le corps dessiné en code est caché : remplacé par un dessin déposé, ou masqué pour l'export. */
  const sansCorps = $derived(!!base || !corps)
  const fichierObjet = (emplacement: keyof Equipe) => {
    const id = equipe[emplacement]
    if (!id) return null
    return premier(victoire ? [`personnage/objets/${id}-victoire`, `personnage/objets/${id}`] : [`personnage/objets/${id}`], peau)
  }
</script>

{#snippet calque(src: string)}
  <image href={src} x={C.x} y={C.y} width={C.l} height={C.h} />
{/snippet}

{#snippet objetEnMain(id: string | null | undefined, x: number, y: number, droite: boolean)}
  {#if id === 'porte-voix'}
    <path d="M{x},{y - 4} L{x + (droite ? 16 : -16)},{y - 14} L{x + (droite ? 18 : -18)},{y + 2} Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <path d="M{x + (droite ? 22 : -22)},{y - 12} q4,6 0,12" fill="none" stroke={P.encre} stroke-width="1.5" />
  {:else if id === 'drapeau'}
    <rect x={x - 1.5} y={y - 58} width="3" height="66" fill={P.encre} />
    <path d="M{x + 1.5},{y - 57} L{x + 34},{y - 51} L{x + 28},{y - 41} L{x + 34},{y - 31} L{x + 1.5},{y - 35} Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" class="flotte" />
  {:else if id === 'lanterne'}
    <line x1={x} y1={y + 3} x2={x} y2={y + 10} stroke={P.encre} stroke-width="1.5" />
    <rect x={x - 5} y={y + 10} width="10" height="13" fill={P.lumiere} stroke={P.encre} stroke-width="1.5" />
    <circle cx={x} cy={y + 16} r="14" fill={P.lumiere} opacity=".22" />
  {:else if id === 'journal'}
    <rect x={x - 7} y={y - 4} width="14" height="18" fill={P.papier} stroke={P.encre} stroke-width="1.5" transform="rotate({droite ? 12 : -12} {x} {y})" />
    <line x1={x - 4} y1={y + 1} x2={x + 4} y2={y + 1} stroke={P.encre} stroke-width="1.5" transform="rotate({droite ? 12 : -12} {x} {y})" />
  {:else if id === 'livre'}
    <rect x={x - 6} y={y - 6} width="12" height="16" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <rect x={x - 4} y={y - 4} width="2" height="12" fill={P.papier} />
  {:else if id === 'pancarte'}
    <rect x={x - 1.5} y={y - 50} width="3" height="56" fill="#8A5A2B" />
    <rect x={x - 22} y={y - 72} width="44" height="24" fill={P.papier} stroke={P.encre} stroke-width="2" />
    <text x={x} y={y - 55} text-anchor="middle" font-family={F} font-weight="900" font-size="11" fill={P.rouge}>EN GRÈVE</text>
  {:else if id === 'tambour'}
    <ellipse cx={x} cy={y + 8} rx="10" ry="4" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <rect x={x - 10} y={y + 8} width="20" height="12" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <path d="M{x - 10},{y + 9} l5,10 l5,-10 l5,10 l5,-10" fill="none" stroke={P.papier} stroke-width="1" />
  {:else if id === 'rose'}
    <line x1={x} y1={y} x2={x + (droite ? 6 : -6)} y2={y - 16} stroke="#3E6B3A" stroke-width="2" />
    <circle cx={x + (droite ? 7 : -7)} cy={y - 19} r="5" fill={P.rouge} stroke={P.encre} stroke-width="1" />
  {/if}
{/snippet}

<g transform={sonne ? 'rotate(-8)' : ''}>
  <!-- DOS -->
  {#if fichierObjet('dos')}
    {@render calque(fichierObjet('dos')!)}
  {:else if equipe.dos === 'banderole' && !victoire}
    <rect x="-16" y="-80" width="34" height="9" rx="4" fill={P.rouge} stroke={P.encre} stroke-width="1.5" transform="rotate(-35 0 -76)" />
  {:else if equipe.dos === 'accordeon'}
    <rect x="-20" y="-80" width="40" height="22" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    {#each [-12, -4, 4, 12] as x (x)}<line x1={x} y1="-80" x2={x} y2="-58" stroke={P.encre} stroke-width="1" />{/each}
  {:else if equipe.dos === 'sac-de-tracts'}
    <path d="M-14,-80 L14,-46" stroke="#8A5A2B" stroke-width="3" />
    <rect x="8" y="-52" width="18" height="16" fill="#8A5A2B" stroke={P.encre} stroke-width="1.5" />
    <rect x="11" y="-58" width="12" height="8" fill={P.papier} stroke={P.encre} stroke-width="1" />
  {/if}

  <!-- CORPS : un dessin déposé (personnage/base-…) remplace tout le corps dessiné en code -->
  {#if sansCorps}
    {#if base}{@render calque(base)}{/if}
  {:else}
    <!-- jambes et chaussures -->
    <rect x="-11" y="-38" width="9" height="36" fill={haut === 'bleu-de-chauffe' ? veste : P.encre} />
    <rect x="3" y="-38" width="9" height="36" fill={haut === 'bleu-de-chauffe' ? veste : P.encre} />
    <rect x="-14" y="-4" width="13" height="5" rx="2" fill={P.encre} />
    <rect x="2" y="-4" width="13" height="5" rx="2" fill={P.encre} />
    <path d="M-16,-38 L-14,-78 Q0,-84 14,-78 L16,-38 Z" fill={veste} stroke={P.encre} stroke-width="1.5" />
  {/if}

  <!-- HAUT -->
  {#if fichierObjet('haut')}
    {@render calque(fichierObjet('haut')!)}
  {:else if haut === 'mariniere'}
    {#each [-72, -64, -56, -48, -42] as y (y)}<line x1="-15" y1={y} x2="15" y2={y} stroke="#2F4A6B" stroke-width="3" />{/each}
  {:else if haut === 'bleu-de-chauffe'}
    <rect x="-9" y="-70" width="18" height="16" fill="#2B4566" stroke={P.encre} stroke-width="1" />
    <line x1="-9" y1="-70" x2="-13" y2="-78" stroke={P.encre} stroke-width="2" /><line x1="9" y1="-70" x2="13" y2="-78" stroke={P.encre} stroke-width="2" />
  {:else if haut === 'tablier'}
    <path d="M-10,-70 L10,-70 L13,-36 L-13,-36 Z" fill="#F4F1EA" stroke={P.encre} stroke-width="1.5" />
    <rect x="-5" y="-60" width="10" height="7" fill="none" stroke={P.encre} stroke-width="1" />
  {:else if !sansCorps}
    <line x1="0" y1="-80" x2="0" y2="-40" stroke={P.encre} stroke-width="1" />
  {/if}

  <!-- bras gauche et MAIN GAUCHE -->
  {#if !sansCorps}
    <path d="M-14,-76 L{mg.x},{mg.y - 2}" stroke={manche} stroke-width="8" stroke-linecap="round" />
    <circle cx={mg.x} cy={mg.y} r="4.5" fill={peau} />
  {/if}
  {#if fichierObjet('main-gauche')}{@render calque(fichierObjet('main-gauche')!)}
  {:else}{@render objetEnMain(equipe['main-gauche'], mg.x, mg.y, false)}{/if}

  <!-- bras droit et MAIN DROITE (levée dans la victoire) -->
  {#if !sansCorps}
    <path d="M14,-76 L{md.x},{md.y + (victoire ? 3 : -2)}" stroke={manche} stroke-width="8" stroke-linecap="round" />
    <circle cx={md.x} cy={md.y} r="4.5" fill={peau} />
  {/if}
  {#if fichierObjet('main-droite')}
    {@render calque(fichierObjet('main-droite')!)}
  {:else if victoire && equipe.dos === 'banderole' && !fichierObjet('dos')}
    <rect x={md.x - 3} y={md.y - 43} width="3" height="46" fill={P.encre} />
    <rect x={md.x} y={md.y - 43} width="64" height="20" fill={P.rouge} stroke={P.encre} stroke-width="1.5" class="flotte" />
    <text x={md.x + 32} y={md.y - 29} text-anchor="middle" font-family={F} font-weight="900" font-size="12" fill={P.papier}>VICTOIRE</text>
  {:else}
    {@render objetEnMain(equipe['main-droite'], md.x, md.y, true)}
  {/if}

  <!-- COL -->
  {#if fichierObjet('col')}
    {@render calque(fichierObjet('col')!)}
  {:else if equipe.col === 'foulard-rouge'}
    <path d="M-9,-80 L9,-80 L0,-68 Z" fill={P.rouge} stroke={P.encre} stroke-width="1" />
    <path d="M6,-79 l10,6 l-4,4 Z" fill={P.rouge} class="flotte" />
  {:else if equipe.col === 'lavalliere'}
    <path d="M0,-78 L-10,-84 L-10,-72 Z M0,-78 L10,-84 L10,-72 Z" fill={P.encre} />
    <circle cx="0" cy="-78" r="2.5" fill={P.encre} />
  {:else if equipe.col === 'echarpe'}
    <path d="M-10,-81 Q0,-76 10,-81 L10,-77 Q0,-72 -10,-77 Z" fill={P.rouge} stroke={P.encre} stroke-width="1" />
    <rect x="4" y="-78" width="6" height="22" fill={P.rouge} stroke={P.encre} stroke-width="1" />
    <line x1="5" y1="-58" x2="9" y2="-58" stroke={P.papier} stroke-width="1.5" />
  {:else if equipe.col === 'cocarde'}
    <circle cx="-7" cy="-70" r="5.5" fill={P.rouge} stroke={P.encre} stroke-width="1" />
    <circle cx="-7" cy="-70" r="3" fill={P.encre} />
    <circle cx="-7" cy="-70" r="1.2" fill={P.rouge} />
  {/if}

  {#if !sansCorps}
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
  {/if}

  <!-- TÊTE -->
  {#if fichierObjet('tete')}
    {@render calque(fichierObjet('tete')!)}
  {:else if equipe.tete === 'casquette'}
    <path d="M-13,-103 Q-12,-115 2,-114 Q14,-113 13,-103 Z" fill={P.grisFonce} stroke={P.encre} stroke-width="1.5" />
    <path d="M6,-104 L21,-101 L13,-99 Z" fill={P.encre} />
  {:else if equipe.tete === 'beret'}
    <ellipse cx="2" cy="-108" rx="15" ry="5" fill={P.encre} transform="rotate(-10 2 -108)" />
    <rect x="1" y="-116" width="2" height="4" fill={P.encre} />
  {:else if equipe.tete === 'bonnet-phrygien'}
    <path d="M-13,-103 Q-14,-118 2,-120 Q16,-121 18,-110 Q14,-114 10,-112 Q14,-106 13,-103 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <circle cx="-7" cy="-106" r="2.5" fill={P.papier} stroke={P.encre} stroke-width=".8" />
  {:else if equipe.tete === 'fichu'}
    <path d="M-14,-100 Q-12,-116 0,-115 Q12,-116 14,-100 Q0,-108 -14,-100 Z" fill={P.rouge} stroke={P.encre} stroke-width="1.5" />
    <circle cx="0" cy="-101" r="1.6" fill={P.papier} /><circle cx="-7" cy="-108" r="1.6" fill={P.papier} /><circle cx="7" cy="-108" r="1.6" fill={P.papier} />
  {/if}

  {#if !sansCorps}
    <!-- visage -->
    {#if sonne}
      <path d="M-7,-101 l4,4 m0,-4 l-4,4 M3,-101 l4,4 m0,-4 l-4,4" stroke={P.encre} stroke-width="1.6" />
      <ellipse cx="0" cy="-91" rx="3" ry="2" fill={P.encre} />
    {:else}
      <circle cx="-4.5" cy="-99" r="1.6" fill={P.encre} />
      <circle cx="4.5" cy="-99" r="1.6" fill={P.encre} />
      <path d={victoire ? 'M-5,-93 Q0,-87 5,-93' : 'M-4,-92 Q0,-90 4,-92'} fill="none" stroke={P.encre} stroke-width="1.5" />
    {/if}
  {/if}
  <!-- VISAGE -->
  {#if fichierObjet('visage')}
    {@render calque(fichierObjet('visage')!)}
  {:else if equipe.visage === 'lunettes' && !sonne}
    <circle cx="-4.5" cy="-99" r="4" fill="none" stroke={P.encre} stroke-width="1.5" />
    <circle cx="4.5" cy="-99" r="4" fill="none" stroke={P.encre} stroke-width="1.5" />
    <line x1="-0.5" y1="-99" x2="0.5" y2="-99" stroke={P.encre} stroke-width="1.5" />
  {:else if equipe.visage === 'binocles' && !sonne}
    <ellipse cx="-4.5" cy="-99" rx="3.2" ry="2.6" fill="none" stroke={P.encre} stroke-width="1.3" />
    <ellipse cx="4.5" cy="-99" rx="3.2" ry="2.6" fill="none" stroke={P.encre} stroke-width="1.3" />
    <path d="M7.7,-99 Q12,-90 8,-82" fill="none" stroke={P.lumiere} stroke-width="1" />
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
