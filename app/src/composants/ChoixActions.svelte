<script lang="ts">
  // Choisir les actions qu'on se sent de mener, et son objectif de la semaine.
  import { texteRecompense } from '@mdl/noyau'
  import { ACTIONS } from '../donnees'
  import { profil } from '../etat/profil.svelte'
  import { ui } from '../etat/interface.svelte'

  let choisies = $state<string[]>([...profil.actionsChoisies])
  let objectif = $state(profil.objectif)
  const PERIODES: Record<string, string> = { jour: 'par jour', semaine: 'par semaine', toujours: 'une seule fois' }
  const modifie = $derived(objectif !== profil.objectif || choisies.length !== profil.actionsChoisies.length || choisies.some((id) => !profil.actionsChoisies.includes(id)))

  function basculer(id: string) {
    choisies = choisies.includes(id) ? choisies.filter((x) => x !== id) : [...choisies, id]
  }

  async function enregistrer() {
    // On garde l'ordre de la configuration.
    await profil.enregistrerEngagement(ACTIONS.actions.map((a) => a.id).filter((id) => choisies.includes(id)), objectif)
    ui.annoncer('Tes actions sont enregistrées. Elles apparaissent dans l\'écran Agir.')
  }
</script>

<p>Coche ce que tu te sens de faire. Seules ces actions apparaîtront dans l'écran <b>Agir</b>, avec ce qu'elles rapportent.</p>

{#each ACTIONS.categories as cat (cat.id)}
  <fieldset>
    <legend>{cat.nom}</legend>
    {#each ACTIONS.actions.filter((a) => a.categorie === cat.id) as a (a.id)}
      <label class="action">
        <input type="checkbox" checked={choisies.includes(a.id)} onchange={() => basculer(a.id)} />
        <span>
          <b>{a.nom}</b>
          <small>{texteRecompense(a.recompense)} · {a.plafond.nombre > 1 ? `${a.plafond.nombre} fois ` : ''}{PERIODES[a.plafond.par]}</small>
        </span>
      </label>
    {/each}
  </fieldset>
{/each}

<label class="objectif">Mon objectif : faire
  <select id="objectif" bind:value={objectif}>
    {#each ACTIONS.objectifs.choix as n (n)}<option value={n}>{n} action{n > 1 ? 's' : ''}</option>{/each}
  </select>
  par semaine
</label>
<p class="discret petit">Atteindre ton objectif rapporte {texteRecompense(ACTIONS.objectifs.recompense)} de plus, une fois par semaine.{ACTIONS.objectifs.manifCompte ? ' Un jour de manif compte comme une action.' : ''}</p>

<div class="ligne">
  <button class="rouge" disabled={!modifie} onclick={enregistrer}>Enregistrer mes actions</button>
  {#if !modifie && profil.actionsChoisies.length}<span class="discret petit">✓ Enregistré</span>{/if}
</div>

<p class="note">Rien ne prouve que tu as fait une action : c'est un jeu de confiance, et chaque action a sa limite. L'app ne garde <b>aucun historique</b> de tes actions, seulement les compteurs du jour et de la semaine en cours.</p>

<style>
  fieldset { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  legend { font-family: var(--f-affiche); font-weight: 900; font-size: 20px; text-transform: uppercase; margin-bottom: 4px; }
  .action { flex-direction: row; align-items: flex-start; gap: 10px; font-weight: 400; padding: 6px 0; border-bottom: 1px solid var(--trait); }
  .action input { width: 20px; height: 20px; flex: none; margin-top: 2px; accent-color: var(--rouge); }
  .action span { display: flex; flex-direction: column; gap: 2px; }
  .action b { font-size: 15px; }
  .action small { color: var(--discret); font-size: 12.5px; }
  .objectif { flex-direction: row; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 15px; }
  .objectif select { width: auto; }
  .petit { font-size: 13px; }
</style>
