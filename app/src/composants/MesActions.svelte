<script lang="ts">
  // Écran Agir : les actions choisies dans le profil, à déclarer quand on les a faites.
  import { texteRecompense } from '@mdl/noyau'
  import { ACTIONS } from '../donnees'
  import { profil } from '../etat/profil.svelte'
  import { ui } from '../etat/interface.svelte'

  const actions = $derived(ACTIONS.actions.filter((a) => profil.actionsChoisies.includes(a.id)))
  const PERIODES: Record<string, string> = { jour: "aujourd'hui", semaine: 'cette semaine', toujours: '' }
  const faites = $derived(profil.faitesCetteSemaine)
  let ouvert = $state<string | null>(null)

  async function faire(id: string) {
    const r = await profil.faire(id)
    if (!r) { ui.annoncer('Déjà déclarée autant que possible pour le moment.'); return }
    const objectif = r.objectifAtteint ? ` Objectif de la semaine atteint !` : ''
    ui.annoncer(`Bravo ! +${texteRecompense(r.recompense)}.${objectif}`)
  }
</script>

<section class="pile serree">
  <div class="tete">
    <h2>Mes actions</h2>
    <a href="#plus" class="lien">Choisir mes actions</a>
  </div>

  {#if !actions.length}
    <p class="note">Choisis les actions que tu te sens de mener dans ton <a href="#plus">profil</a> : tracter, coller des affiches, faire grève, soutenir une caisse de grève, transmettre une histoire de lutte… Chacune rapporte des fragments ou des boosters.</p>
  {:else}
    <div class="objectif">
      <div class="ligne entre"><b>Objectif de la semaine</b><span>{Math.min(faites, profil.objectif)} / {profil.objectif}</span></div>
      <div class="barre" role="progressbar" aria-label="Objectif de la semaine" aria-valuemin={0} aria-valuemax={profil.objectif} aria-valuenow={Math.min(faites, profil.objectif)}>
        <i style="width: {Math.min(1, faites / profil.objectif) * 100}%"></i>
      </div>
      <small>{faites >= profil.objectif ? '✓ Atteint : bonus gagné. Continue, chaque action rapporte quand même.' : `Atteint, il rapporte ${texteRecompense(ACTIONS.objectifs.recompense)} de plus.`}</small>
    </div>

    <ul>
      {#each actions as a (a.id)}
        {@const reste = profil.restantes(a.id)}
        <li class:fait={!reste}>
          <div class="texte">
            <b>{a.nom}</b>
            <small>{texteRecompense(a.recompense)}{a.plafond.par !== 'toujours' && reste ? ` · encore ${reste} ${PERIODES[a.plafond.par]}` : ''}</small>
            {#if a.conseil}
              <button class="info" aria-expanded={ouvert === a.id} onclick={() => (ouvert = ouvert === a.id ? null : a.id)}>{ouvert === a.id ? 'Masquer le conseil' : 'Conseil'}</button>
              {#if ouvert === a.id}<p class="conseil">{a.conseil}</p>{/if}
            {/if}
          </div>
          <button class={reste ? 'rouge' : ''} disabled={!reste} onclick={() => faire(a.id)}>
            {reste ? "Je l'ai fait" : a.plafond.par === 'toujours' ? 'Fait ✓' : `Fait ${PERIODES[a.plafond.par]} ✓`}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .serree { gap: 10px; }
  .tete { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; border-bottom: 2px solid var(--encre); padding-bottom: 6px; }
  .lien { color: var(--encre); font-size: 13px; font-weight: 700; }
  .note a { color: inherit; }
  .objectif { display: flex; flex-direction: column; gap: 6px; }
  .entre { justify-content: space-between; }
  .objectif span { font-family: var(--f-affiche); font-weight: 900; font-size: 20px; color: var(--rouge); font-variant-numeric: tabular-nums; }
  .objectif small { color: var(--discret); font-size: 12.5px; }
  .barre { height: 10px; border: 2px solid var(--encre); position: relative; }
  .barre i { position: absolute; inset: 0 auto 0 0; background: var(--rouge); }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  li { display: flex; gap: 10px; align-items: center; justify-content: space-between; border: 2px solid var(--encre); background: var(--carte); padding: 10px 12px; }
  li.fait { border-color: var(--trait); }
  .texte { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .texte b { font-size: 15px; }
  .texte small { color: var(--discret); font-size: 12.5px; }
  li > button { flex: none; padding: 8px 10px; font-size: 12px; }
  .info { align-self: flex-start; border: 0; padding: 0; font-size: 12px; text-decoration: underline; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--discret); }
  .conseil { font-size: 13px; font-family: var(--f-texte); border-left: 3px solid var(--rouge); padding-left: 8px; }
</style>
