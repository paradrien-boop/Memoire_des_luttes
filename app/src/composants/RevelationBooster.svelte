<script lang="ts">
  import type { ResultatBooster } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import CarteMini from './CarteMini.svelte'

  let { resultat }: { resultat: ResultatBooster } = $props()
  let retournees = $state<boolean[]>([])

  function toucher(i: number) {
    if (retournees[i]) ui.ouvrirCarte(resultat.cartes[i].id)
    else retournees[i] = true
  }
</script>

<div class="surtitre">{resultat.libelle}</div>
<h2>Touche les cartes pour les retourner</h2>
<div class="revelation">
  {#each resultat.cartes as carte, i (i)}
    <button class="retourne" class:ouverte={retournees[i]} onclick={() => toucher(i)} aria-label={retournees[i] ? 'Lire ' + carte.title : 'Retourner la carte ' + (i + 1)}>
      <div class="interieur">
        <div class="dos" aria-hidden="true">✊</div>
        <div class="face"><CarteMini {carte} nouvelle={resultat.nouvelles[i]} inerte /></div>
      </div>
    </button>
  {/each}
</div>
<p class="discret">Une fois retournée, touche une carte pour la lire.</p>
<div class="ligne">
  <button class="rouge" onclick={() => (retournees = resultat.cartes.map(() => true))}>Tout retourner</button>
  <button class="encre" onclick={() => ui.fermer()}>Ranger dans l'album</button>
</div>

<style>
  h2 { text-align: center; }
  p { text-align: center; }
  .revelation { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: 100%; padding-right: 4px; }
  .retourne { all: unset; cursor: pointer; perspective: 900px; min-width: 0; }
  .retourne:focus-visible { outline: 3px solid var(--rouge); outline-offset: 3px; }
  .interieur { position: relative; transition: transform .7s cubic-bezier(.2, .8, .2, 1); transform-style: preserve-3d; }
  .ouverte .interieur { transform: rotateY(180deg); }
  .face { transform: rotateY(180deg); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .dos {
    position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: var(--rouge); border: 2px solid var(--encre);
    display: grid; place-items: center; color: var(--sur-rouge); font-family: var(--f-affiche); font-weight: 900; font-size: 44px;
    background-image: repeating-linear-gradient(45deg, transparent 0 10px, rgba(0, 0, 0, .12) 10px 20px);
  }
</style>
