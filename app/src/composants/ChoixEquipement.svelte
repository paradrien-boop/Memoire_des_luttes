<script lang="ts">
  // Dans le profil : choisir quel objet débloqué mettre sur chaque emplacement du personnage.
  import { EFFETS, EMPLACEMENTS, OBJETS, type Emplacement } from '@mdl/noyau'
  import { quartier } from '../etat/quartier.svelte'
  import { catalogue } from '../donnees'

  const debloques = $derived(new Set(quartier.debloques.map((o) => o.id)))
  let detail = $state<string | null>(null)
  const choisir = (e: Emplacement, id: string | null) => quartier.equiper(e, id)
</script>

<p class="petit">Chaque famille de cartes débloque trois objets, à 1, 3 puis 6 cartes différentes. Choisis ce que ton personnage porte : un objet par emplacement. Les objets à <b>pouvoir</b> ne servent pendant les batailles que s'ils sont portés. Le choix est enregistré tout de suite.</p>

{#each EMPLACEMENTS as e (e.id)}
  {@const objets = OBJETS.filter((o) => o.emplacement === e.id)}
  <fieldset>
    <legend>{e.nom}</legend>
    <div class="choix" role="radiogroup" aria-label={e.nom}>
      <button class="option" class:choisi={!quartier.equipe[e.id]} role="radio" aria-checked={!quartier.equipe[e.id]} onclick={() => choisir(e.id, null)}>Rien</button>
      {#each objets as o (o.id)}
        {@const libre = debloques.has(o.id)}
        <button
          class="option"
          class:choisi={quartier.equipe[e.id] === o.id}
          class:verrouille={!libre}
          role="radio"
          aria-checked={quartier.equipe[e.id] === o.id}
          aria-disabled={!libre}
          onclick={() => (libre ? choisir(e.id, o.id) : (detail = detail === o.id ? null : o.id))}
        >{libre ? '' : '🔒 '}{o.nom}{o.pouvoir !== 'aucun' ? ' ★' : ''}</button>
      {/each}
    </div>
    {#each objets.filter((o) => quartier.equipe[e.id] === o.id || detail === o.id) as o (o.id)}
      <p class="detail">
        {#if debloques.has(o.id)}{EFFETS[o.pouvoir]}
        {:else}À débloquer : {o.palier} carte{o.palier > 1 ? 's' : ''} différente{o.palier > 1 ? 's' : ''} de la famille « {catalogue.familles[o.famille]?.libelle} » (tu en as {quartier.cartesParFamille[o.famille] ?? 0}). {EFFETS[o.pouvoir]}{/if}
      </p>
    {/each}
  </fieldset>
{/each}

<style>
  .petit { font-size: 13px; }
  fieldset { border: 0; margin: 0; padding: 8px 0; border-bottom: 1px solid var(--trait); display: flex; flex-direction: column; gap: 6px; }
  legend { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--discret); padding: 0; }
  .choix { display: flex; gap: 6px; flex-wrap: wrap; }
  .option { padding: 6px 10px; font-size: 12.5px; text-transform: none; letter-spacing: 0; font-weight: 600; }
  .option.choisi { background: var(--encre); color: var(--papier); border-color: var(--encre); }
  .option.verrouille { border-style: dashed; border-color: var(--trait); color: var(--discret); }
  .detail { font-family: var(--f-texte); font-size: 13.5px; }
</style>
