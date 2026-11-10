<script lang="ts">
  import { progression, REGLES } from '@mdl/noyau'
  import Entete from '../composants/Entete.svelte'
  import { jeu } from '../etat/jeu.svelte'
  import { ui } from '../etat/interface.svelte'
  import { catalogue } from '../donnees'
  import { dateDuJour, duree } from '../outils'

  let code = $state('')
  const session = $derived(jeu.chrono.session)
  const plafond = $derived(jeu.chrono.journee.date === dateDuJour() && jeu.chrono.journee.gagnes >= REGLES.boostersMaxParJour)
  const gagnesAujourdhui = $derived(jeu.chrono.journee.date === dateDuJour() ? jeu.chrono.journee.gagnes : 0)

  async function basculer() {
    if (session) { await jeu.terminerManif(); ui.annoncer('Manif terminée. À la prochaine !') }
    else { await jeu.demarrerManif(); ui.annoncer("C'est parti. Bonne manif !") }
  }

  async function ouvrir() {
    const r = await jeu.ouvrirBooster()
    if (r) ui.booster = r
  }

  async function valider(e: SubmitEvent) {
    e.preventDefault()
    const r = await jeu.utiliserCode(code)
    if (r.type === 'inconnu') ui.annoncer("Code inconnu. Vérifie l'orthographe.")
    else if (r.type === 'deja') ui.annoncer('Ce code a déjà été utilisé sur ce téléphone.')
    else {
      code = ''
      if (r.type === 'evenement') { ui.annoncer("Carte d'événement ajoutée à ton album !"); ui.ouvrirCarte(r.id) }
      else ui.booster = r.resultat
    }
  }
</script>

<Entete surtitre="Pack de départ · Commune 1871" titre="Mémoire des luttes" marque={'Tout reste\nsur ton\ntéléphone'} />

<div class="pile">
  <section class="session" class:active={session}>
    <div class="surtitre">{session ? 'En cortège depuis' : 'Pas de manif en cours'}</div>
    <div class="chrono">{duree(session?.effectif ?? 0)}</div>
    {#if session}
      <div class="pile serree">
        <div class="barre" role="progressbar" aria-label="Prochain booster" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progression(session) * 100)}>
          <i style="width: {progression(session) * 100}%"></i>
        </div>
        <p class="discret petit">
          {plafond ? `Plafond du jour atteint : ${REGLES.boostersMaxParJour} boosters. Reviens à la prochaine manif !`
            : `Un booster toutes les ${REGLES.minutesParBooster} minutes · ${gagnesAujourdhui}/${REGLES.boostersMaxParJour} gagnés aujourd'hui`}
        </p>
      </div>
    {:else}
      <p class="discret">Lance le compteur en arrivant au rassemblement. L'app n'a pas besoin de rester ouverte : elle compte avec l'heure du téléphone, sans GPS ni réseau.</p>
    {/if}
    <button class="geant {session ? 'encre' : 'rouge'}" onclick={basculer}>{session ? 'Fin de la manif' : 'Je manifeste'}</button>
    <label class="case">
      <input type="checkbox" checked={jeu.vitesse > 1} onchange={(e) => jeu.changerVitesse(e.currentTarget.checked ? 60 : 1)} />
      Mode démo : le temps passe 60 fois plus vite (un booster toutes les 45 s)
    </label>
  </section>

  <section class="booster">
    <div class="enveloppe" aria-hidden="true">×{jeu.boosters}</div>
    <div class="pile serree large">
      <h2>{jeu.boosters === 0 ? 'Aucun booster' : jeu.boosters === 1 ? '1 booster à ouvrir' : `${jeu.boosters} boosters à ouvrir`}</h2>
      <p class="discret petit">{REGLES.cartesParBooster} cartes par booster. Si {REGLES.garantieApres} boosters de suite n'ont rien donné de rare, le suivant contient forcément une carte rare.</p>
      <div><button class="rouge" disabled={jeu.boosters < 1} onclick={ouvrir}>Ouvrir un booster</button></div>
    </div>
  </section>

  <div class="stats">
    <div><b>{jeu.nombreOfficielles}/{catalogue.officielles.length}</b><span>Cartes</span></div>
    <div><b>{jeu.chrono.jours.length}</b><span>Jours de manif</span></div>
    <div><b>{jeu.ouverts}</b><span>Boosters ouverts</span></div>
  </div>

  <section class="encart">
    <div><div class="surtitre">Stand, tract, banderole</div><h2>Code de stand</h2></div>
    <p class="petit">À l'étape 4, on scannera le QR collé sur un stand ou un tract. En attendant, tape le code imprimé dessous. À essayer : <b>COMMUNE-71</b>, <b>MUR-28-MAI</b>, ou <b>18-MARS-2027</b> pour une carte d'événement scellée.</p>
    <form class="ligne" onsubmit={valider}>
      <input id="code-stand" bind:value={code} placeholder="Code du stand" autocomplete="off" aria-label="Code du stand" />
      <button class="encre">Valider</button>
    </form>
  </section>
</div>

<style>
  .serree { gap: 6px; }
  .large { flex: 1; min-width: 0; }
  .petit { font-size: 13px; }
  .session { border: 3px solid var(--encre); background: var(--carte); padding: 18px; display: flex; flex-direction: column; gap: 14px; }
  .session.active { border-color: var(--rouge); }
  .chrono { font-family: var(--f-affiche); font-weight: 900; font-size: 64px; line-height: .9; font-variant-numeric: tabular-nums; }
  .active .chrono { color: var(--rouge); }
  .barre { height: 12px; border: 2px solid var(--encre); position: relative; }
  .barre i { position: absolute; inset: 0 auto 0 0; background: var(--rouge); }
  .geant { font-family: var(--f-affiche); font-size: 30px; font-weight: 900; padding: 14px 18px; width: 100%; letter-spacing: .03em; }
  .case { flex-direction: row; align-items: center; gap: 8px; font-weight: 500; }
  .case input { width: auto; }
  .booster { display: flex; gap: 16px; align-items: center; border: 3px dashed var(--rouge); padding: 16px; }
  .enveloppe { flex: none; width: 74px; aspect-ratio: 5 / 7; background: var(--rouge); color: var(--sur-rouge); display: grid; place-items: center; font-family: var(--f-affiche); font-weight: 900; font-size: 30px; transform: rotate(-4deg); box-shadow: 5px 5px 0 var(--encre); }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); border: 2px solid var(--encre); }
  .stats div { padding: 10px 12px; border-right: 2px solid var(--encre); }
  .stats div:last-child { border-right: 0; }
  .stats b { display: block; font-family: var(--f-affiche); font-size: 34px; font-weight: 900; line-height: 1; font-variant-numeric: tabular-nums; }
  .stats span { font-size: 12px; color: var(--discret); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  form input { flex: 1; min-width: 0; }
</style>
