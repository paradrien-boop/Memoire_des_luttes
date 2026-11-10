<script lang="ts">
  import type { CarteAffichee } from '../etat/jeu.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { catalogue } from '../donnees'
  import { initiales } from '../outils'
  import { RARETES } from '../libelles'

  let { carte }: { carte: CarteAffichee } = $props()

  const champs = $derived((catalogue.familles[carte.fam] ?? catalogue.familles.evenement).champs)
  const texte = (cle: string) => (typeof carte[cle] === 'string' ? (carte[cle] as string) : '')
  const sousTitre = $derived(champs.filter((c) => c.role === 'sub' && texte(c.cle)).map((c) => texte(c.cle)).join(' · '))
  const auteurCitation = $derived(champs.some((c) => c.role === 'quoteSrc') ? texte('phraseSrc') : '')
  const liens = $derived((carte.links ?? []).filter((id) => jeu.existe(id)).map((id) => ({ id, carte: jeu.carte(id) })))
</script>

<article class="carte r-{carte.rar}">
  <header class="bandeau"><span>{RARETES[carte.rar] ?? ''}</span><span>{catalogue.familles[carte.fam]?.libelle ?? ''}</span></header>
  <div class="visuel">
    {#if carte.img}<img src={carte.img} alt="" />{:else}<span aria-hidden="true">{initiales(carte.title)}</span>{/if}
    {#if carte.numero}<div class="numero">N° {String(carte.numero).padStart(4, '0')} / {carte.tirage}</div>{/if}
  </div>
  <div class="corps">
    <div>
      <h3>{carte.title || 'Sans titre'}</h3>
      {#if sousTitre}<div class="sous-titre">{sousTitre}</div>{/if}
    </div>
    {#each champs as champ (champ.cle)}
      {#if texte(champ.cle)}
        {#if champ.role === 'text' || champ.role === 'more'}
          <div><h4>{champ.libelle}</h4><p>{texte(champ.cle)}</p></div>
        {:else if champ.role === 'why'}
          <div class="regard"><h4>{champ.libelle}</h4><p>{texte(champ.cle)}</p></div>
        {:else if champ.role === 'quote'}
          <blockquote>« {texte(champ.cle)} »{#if auteurCitation}<cite>{auteurCitation}</cite>{/if}</blockquote>
        {/if}
      {/if}
    {/each}
    {#if liens.length}
      <div>
        <h4>Liée à</h4>
        <div class="liens">
          {#each liens as l (l.id)}
            {#if l.carte}<button class="lien" onclick={() => ui.ouvrirCarte(l.id)}>{l.carte.title}</button>
            {:else}<span class="lien a-trouver">? carte à trouver</span>{/if}
          {/each}
        </div>
      </div>
    {/if}
    <footer>
      {#if carte.origine === 'officiel'}<span class="sceau">✊ Pack officiel</span>
      {:else if carte.origine === 'local'}<span class="sceau local">✊ Pack local : {carte.collectif}</span>
      {:else if carte.origine === 'evenement'}<span class="sceau">🔒 Scellée par le collectif · non modifiable</span>
      {:else if carte.origine === 'importe'}<span>Pack importé, non signé : {carte.nomPack}</span>
      {:else}<span>Carte perso</span>{/if}
      <span>{texte('src')}</span>
    </footer>
  </div>
</article>

<style>
  .carte { background: var(--carte); border: 2px solid var(--encre); width: 100%; max-width: 380px; display: flex; flex-direction: column; box-shadow: 6px 6px 0 var(--encre); }
  .bandeau { display: flex; justify-content: space-between; gap: 8px; padding: 6px 10px; background: var(--encre); color: var(--papier); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
  .r-rare .bandeau { background: var(--rouge); color: var(--sur-rouge); }
  .r-legendaire { border-color: var(--or); box-shadow: 6px 6px 0 var(--or); }
  .r-legendaire .bandeau { background: var(--or); color: var(--carte); }
  .r-evenement { border: 3px double var(--rouge); box-shadow: 6px 6px 0 var(--rouge); }
  .r-evenement .bandeau { background: repeating-linear-gradient(-45deg, var(--rouge) 0 8px, var(--encre) 8px 16px); color: var(--sur-rouge); }
  .r-evenement .bandeau span { background: var(--rouge); padding: 0 4px; }
  .visuel { aspect-ratio: 16 / 9; max-width: 100%; display: grid; place-items: center; position: relative; overflow: hidden; border-bottom: 2px solid var(--encre); background: radial-gradient(var(--trame) 34%, transparent 36%) 0 0 / 9px 9px, var(--carte); }
  .visuel span { font-family: var(--f-affiche); font-weight: 900; font-size: 92px; line-height: 1; }
  .visuel img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.15); mix-blend-mode: multiply; }
  .numero { position: absolute; right: 8px; bottom: 8px; background: var(--encre); color: var(--papier); font-family: var(--f-affiche); font-weight: 900; font-size: 18px; padding: 2px 8px; font-variant-numeric: tabular-nums; }
  .corps { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
  h3 { font-size: 30px; font-weight: 900; }
  .sous-titre { font-family: var(--f-affiche); font-weight: 700; font-size: 17px; color: var(--rouge); letter-spacing: .04em; margin-top: 2px; }
  h4 { margin: 0 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--discret); }
  p { font-family: var(--f-texte); font-size: 14.5px; line-height: 1.5; }
  .regard { border-left: 4px solid var(--rouge); padding-left: 10px; }
  blockquote { margin: 0; font-family: var(--f-texte); font-style: italic; font-size: 16px; line-height: 1.4; padding: 8px 0; border-block: 1.5px solid var(--trait); }
  cite { display: block; font-style: normal; font-family: var(--f-interface); font-size: 12px; color: var(--discret); margin-top: 4px; }
  .liens { display: flex; flex-wrap: wrap; gap: 6px; }
  .lien { font: inherit; font-size: 12px; font-weight: 700; border: 1.5px solid var(--encre); padding: 3px 8px; border-radius: 20px; background: transparent; color: var(--encre); cursor: pointer; }
  .a-trouver { border-style: dashed; color: var(--discret); border-color: var(--trait); cursor: default; }
  footer { font-size: 11px; color: var(--discret); border-top: 1.5px solid var(--trait); padding-top: 8px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .sceau { font-weight: 700; color: var(--or); }
  .sceau.local { color: var(--discret); }
</style>
