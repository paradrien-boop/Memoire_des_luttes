<script lang="ts">
  // Écran neutre : rien ne montre de quelle app il s'agit, ni ce qu'elle contient.
  import { verrou } from '../etat/verrou.svelte'
  let code = $state('')
  let erreur = $state('')
  let maintenant = $state(Date.now())
  $effect(() => { const t = setInterval(() => (maintenant = Date.now()), 1000); return () => clearInterval(t) })
  const attente = $derived(Math.max(0, Math.ceil((verrou.attenteJusqua - maintenant) / 1000)))

  $effect(() => {
    const titre = document.title
    document.title = 'Code'
    return () => { document.title = titre }
  })

  async function taper(c: string) {
    erreur = ''
    if (c === '⌫') { code = code.slice(0, -1); return }
    if (code.length >= 8) return
    code += c
  }

  async function valider() {
    if (attente) return
    if (await verrou.ouvrir(code)) return
    code = ''
    erreur = verrou.attenteJusqua > Date.now() ? 'Trop d\'essais. Patiente un peu.' : 'Code incorrect.'
  }
</script>

<div class="verrou" role="dialog" aria-modal="true" aria-label="Code">
  <div class="points" aria-live="polite" aria-label="{code.length} chiffres tapés">
    {#each Array(Math.max(4, code.length)) as _, i (i)}<span class:plein={i < code.length}></span>{/each}
  </div>
  <p class="message" role="status">{attente ? `Réessaie dans ${attente} s.` : erreur || 'Code'}</p>
  <div class="clavier">
    {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'] as t (t)}
      <button
        aria-label={t === '⌫' ? 'Effacer un chiffre' : t === 'OK' ? 'Valider' : t}
        disabled={!!attente}
        onclick={() => (t === 'OK' ? valider() : taper(t))}
      >{t}</button>
    {/each}
  </div>
</div>

<svelte:window onkeydown={(e) => { if (/^\d$/.test(e.key)) taper(e.key); else if (e.key === 'Backspace') taper('⌫'); else if (e.key === 'Enter') valider() }} />

<style>
  /* Volontairement neutre : gris, sans couleur ni police de l'app. */
  .verrou {
    position: fixed; inset: 0; z-index: 100; background: #2B2B2B; color: #F2F2F2;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
    font-family: system-ui, sans-serif;
    padding: env(safe-area-inset-top, 0px) max(16px, env(safe-area-inset-right, 0px)) env(safe-area-inset-bottom, 0px) max(16px, env(safe-area-inset-left, 0px));
  }
  .points { display: flex; gap: 14px; min-height: 16px; }
  .points span { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #F2F2F2; }
  .points span.plein { background: #F2F2F2; }
  .message { font-size: 15px; min-height: 1.4em; }
  .clavier { display: grid; grid-template-columns: repeat(3, 72px); gap: 14px; }
  .clavier button {
    width: 72px; height: 72px; border-radius: 50%; border: 0; background: #444; color: #F2F2F2;
    font: 500 24px system-ui, sans-serif; text-transform: none; letter-spacing: 0; padding: 0;
  }
  .clavier button:focus-visible { outline: 3px solid #F2F2F2; outline-offset: 2px; }
</style>
