<script lang="ts">
  // Dans le quartier : ce que porte le personnage. L'équipement se choisit dans le profil.
  import { EFFETS, EMPLACEMENTS, OBJET_PAR_ID } from '@mdl/noyau'
  import Personnage from '../dessins/Personnage.svelte'
  import { quartier } from '../etat/quartier.svelte'
  import { profil } from '../etat/profil.svelte'

  const a = $derived(quartier.apparence)
  const portes = $derived(EMPLACEMENTS.map((e) => ({ e, objet: quartier.equipe[e.id] ? OBJET_PAR_ID[quartier.equipe[e.id]!] : null })).filter((x) => x.objet))
</script>

<div class="perso">
  <svg viewBox="-60 -170 120 176" role="img" aria-label="Ton personnage et son équipement">
    <Personnage teint={a.teint} coiffure={a.coiffure} equipe={quartier.equipe} />
  </svg>
  <div class="texte">
    {#if portes.length}
      <ul>
        {#each portes as { e, objet } (e.id)}
          <li><span class="emplacement">{e.nom}</span> {objet!.nom}{#if objet!.pouvoir !== 'aucun'} <b class="pouvoir">· pouvoir</b>{/if}</li>
        {/each}
      </ul>
    {:else}
      <p class="petit">Pas encore d'objet : chaque famille de cartes en débloque trois.</p>
    {/if}
    <p class="petit"><a href="#plus">Choisir l'équipement de {profil.personnage?.nom ?? 'ton personnage'} dans le profil</a> · {quartier.debloques.length} objet{quartier.debloques.length > 1 ? 's' : ''} débloqué{quartier.debloques.length > 1 ? 's' : ''} sur 24.</p>
  </div>
</div>
<p class="discret petit">{EFFETS.aucun} Les objets à pouvoir (porte-voix, banderole, livre) servent pendant les batailles, s'ils sont portés.</p>

<style>
  .perso { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
  svg { width: 120px; height: auto; flex: none; background: var(--papier); border: 2px solid var(--encre); }
  .texte { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 8px; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; font-family: var(--f-texte); font-size: 14px; }
  .emplacement { font-family: var(--f-interface); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--discret); display: inline-block; width: 7.5em; }
  .pouvoir { color: var(--rouge); font-family: var(--f-interface); font-size: 12px; }
  .petit { font-size: 13px; }
  a { color: inherit; }
</style>
