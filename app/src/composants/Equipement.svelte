<script lang="ts">
  // Le personnage : son apparence (choisie) et ses objets (gagnés en collectionnant chaque famille de cartes).
  import { avantNiveauSuivant, OBJETS, PALIERS_OBJET, utilisationsParJour } from '@mdl/noyau'
  import Personnage from '../dessins/Personnage.svelte'
  import { quartier } from '../etat/quartier.svelte'
  import { catalogue } from '../donnees'
  import { profil } from '../etat/profil.svelte'

  const a = $derived(quartier.apparence)
  const NIVEAUX = ['pas encore', 'niveau 1', 'niveau 2', 'niveau 3']
</script>

<div class="perso">
  <svg viewBox="-60 -150 120 156" role="img" aria-label="Ton personnage et ses objets">
    <Personnage teint={a.teint} coiffure={a.coiffure} objets={quartier.objets} />
  </svg>
  <p class="petit">{profil.personnage ? profil.personnage.nom : 'Ton personnage'} porte les objets gagnés avec ta collection. <a href="#plus">Modifier son apparence dans le profil</a>.</p>
</div>

<p class="discret petit">Chaque famille de cartes donne un objet, qui s'améliore à {PALIERS_OBJET.join(', ')} cartes différentes de la famille. Les objets à pouvoir servent une fois par jour et par niveau pendant les batailles.</p>
<ul class="objets">
  {#each Object.values(OBJETS) as o (o.famille)}
    {@const n = quartier.objets[o.famille] ?? 0}
    {@const manque = avantNiveauSuivant(quartier.cartesParFamille[o.famille] ?? 0)}
    <li class:gagne={n > 0}>
      <div class="nom"><b>{o.nom}</b> <span class="famille">{catalogue.familles[o.famille]?.libelle}</span></div>
      <div class="niveau">{NIVEAUX[n]}{#if o.pouvoir !== 'aucun' && n} · {utilisationsParJour(n)}/jour{/if}</div>
      <div class="effet">{o.effet}{#if manque !== null} <span class="manque">Encore {manque} carte{manque > 1 ? 's' : ''} « {catalogue.familles[o.famille]?.libelle} » pour le niveau suivant.</span>{/if}</div>
    </li>
  {/each}
</ul>

<style>
  .perso { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  svg { width: 120px; height: auto; flex: none; background: var(--papier); border: 2px solid var(--encre); }
  .petit { font-size: 13px; flex: 1; min-width: 180px; }
  .perso a { color: inherit; }
  .objets { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .objets li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; padding: 8px 0; border-bottom: 1.5px solid var(--trait); }
  /* Un objet pas encore gagné : nom et niveau en couleur discrète (contraste suffisant), sans transparence. */
  .objets li:not(.gagne) .nom b, .objets li:not(.gagne) .niveau { color: var(--discret); }
  .nom b { font-family: var(--f-affiche); text-transform: uppercase; font-size: 17px; }
  .famille { font-size: 11px; color: var(--discret); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  .niveau { font-weight: 700; color: var(--rouge); font-size: 13px; text-align: right; }
  .effet { grid-column: 1 / -1; font-family: var(--f-texte); font-size: 14px; }
  .manque { color: var(--discret); font-size: 13px; }
</style>
