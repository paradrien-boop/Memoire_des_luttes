<script lang="ts">
  import { empreinte } from '@mdl/noyau'
  import ImportPack from './ImportPack.svelte'
  import BoutonConfirme from './BoutonConfirme.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { catalogue, RACINES, CLE_DEMO } from '../donnees'

  const installes = $derived(new Set(jeu.packs.map((p) => p.id)))
  const integres = $derived(catalogue.packs.filter((p) => !installes.has(p.id)))
  const racinesReelles = RACINES.filter((k) => k !== CLE_DEMO?.publique)
</script>

<div class="pile">
  <div class="cle">
    <b>Clé du collectif</b>
    {#if racinesReelles.length}
      {#each racinesReelles as k (k)}<code>{empreinte(k)}</code>{/each}
      <small>Compare cette empreinte avec celle publiée par le collectif : si elles diffèrent, cette app n'est pas la bonne.</small>
    {:else}
      <small>Aucune clé n'est encore intégrée à cette version : seuls les packs intégrés à l'app et les packs non signés sont utilisables.</small>
    {/if}
    {#if CLE_DEMO}<small class="demo">Version de démonstration : la clé de démo <code>{empreinte(CLE_DEMO.publique)}</code> est acceptée. Elle ne l'est jamais dans l'app publiée.</small>{/if}
  </div>

  <ul>
    {#each integres as p (p.id)}
      <li><div><b>{p.nom}</b><span class="badge officiel">✊ Intégré à l'app</span></div><small>{p.cartes.length} cartes</small></li>
    {/each}
    {#each jeu.packs as p (p.id)}
      {@const invalide = jeu.packsInvalides[p.id]}
      <li class:attente={p.confiance === 'local' && !p.accepte}>
        <div>
          <b>{p.pack.nom}</b>
          {#if invalide}<span class="badge invalide">✗ Plus valide</span>
          {:else if p.confiance === 'officiel'}<span class="badge officiel">✊ Officiel</span>
          {:else}<span class="badge local">✊ Local · {p.collectif?.nom}</span>{/if}
        </div>
        <small>{p.pack.cartes.length} cartes · signé par la clé <code>{empreinte(p.pack.signature!.cle)}</code>{#if p.delegation} · délégation valable jusqu'au {p.delegation.expire}{/if}</small>
        {#if invalide}<small class="raison">{invalide}</small>{/if}
        {#if p.confiance === 'local' && !invalide}
          {#if p.accepte}
            <small>Tu fais confiance à ce collectif : ses cartes tombent dans tes boosters et ses QR de stand sont acceptés.</small>
            <div class="ligne"><button onclick={() => { jeu.accepterPack(p.id, false); ui.annoncer('Tu ne fais plus confiance à ce collectif.') }}>Ne plus faire confiance</button></div>
          {:else}
            <small>Signé par le collectif local « {p.collectif?.nom} », reconnu par le collectif. Ses cartes ne tombent dans tes boosters que si tu lui fais confiance.</small>
            <div class="ligne"><button class="rouge" onclick={() => { jeu.accepterPack(p.id, true); ui.annoncer(`Tu fais confiance à « ${p.collectif?.nom} ».`) }}>Faire confiance</button></div>
          {/if}
        {/if}
        <div class="ligne"><BoutonConfirme libelle="Retirer ce pack" confirmation="Oui, retirer" action={() => { jeu.retirerPack(p.id); ui.annoncer('Pack retiré. Les cartes déjà obtenues restent comptées.') }} /></div>
      </li>
    {/each}
  </ul>

  <h3>Installer un pack</h3>
  <p class="petit">Un pack reçu en fichier ou en texte. S'il est signé, l'app vérifie la signature toute seule, sans réseau.</p>
  <ImportPack />
</div>

<style>
  .cle { display: flex; flex-direction: column; gap: 4px; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 13px; background: var(--papier); padding: 1px 4px; }
  small { color: var(--discret); font-size: 12.5px; }
  .demo { color: var(--rouge); }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  li { border: 1.5px solid var(--trait); padding: 10px; display: flex; flex-direction: column; gap: 6px; background: var(--papier); }
  li.attente { border-color: var(--rouge); border-style: dashed; }
  li > div:first-child { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
  .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
  .officiel { color: var(--or); }
  .local { color: var(--discret); }
  .invalide, .raison { color: var(--rouge); }
  h3 { font-size: 20px; }
  .petit { font-size: 13px; }
  li :global(button) { padding: 5px 10px; font-size: 11px; }
</style>
