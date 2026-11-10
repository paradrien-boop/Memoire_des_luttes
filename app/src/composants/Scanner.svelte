<script lang="ts">
  // Scanner de QR. L'appareil photo n'est allumé que pendant que cette fenêtre est ouverte, et rien n'est enregistré.
  // Sans appareil photo utilisable (refus, ordinateur…), on peut prendre une photo du QR ou taper le code.
  import QrScanner from 'qr-scanner'
  import { ui } from '../etat/interface.svelte'
  import { utiliserQr } from '../etat/scan'

  let video: HTMLVideoElement
  let camera = $state<'attente' | 'active' | 'indisponible'>('attente')
  let texte = $state('')
  let occupe = false

  async function traiter(t: string) {
    if (occupe) return
    occupe = true
    const ok = await utiliserQr(t)
    // Après un refus, on laisse une seconde pour lire le message, puis on rescanne.
    if (!ok) setTimeout(() => (occupe = false), 1500)
  }

  $effect(() => {
    let s: QrScanner | null = null
    let ferme = false
    ;(async () => {
      try {
        if (!(await QrScanner.hasCamera())) { camera = 'indisponible'; return }
        s = new QrScanner(video, (r) => traiter(r.data), { returnDetailedScanResult: true, preferredCamera: 'environment', highlightScanRegion: true, maxScansPerSecond: 8 })
        await s.start()
        if (ferme) s.destroy()
        else camera = 'active'
      } catch { camera = 'indisponible' }
    })()
    return () => { ferme = true; s?.destroy() }
  })

  async function photo(e: Event) {
    const fichier = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!fichier) return
    try {
      const r = await QrScanner.scanImage(fichier, { returnDetailedScanResult: true })
      occupe = false
      await traiter(r.data)
    } catch { ui.annoncer('Aucun QR trouvé sur cette photo. Rapproche-toi, évite les reflets, et réessaie.') }
  }

  async function valider(e: SubmitEvent) {
    e.preventDefault()
    if (!texte.trim()) return
    occupe = false
    if (await utiliserQr(texte)) texte = ''
  }
</script>

<div class="surtitre">Stand, tract, camarade</div>
<h2>Scanner un QR</h2>

<div class="video" class:cachee={camera !== 'active'}>
  <!-- svelte-ignore a11y_media_has_caption -->
  <video bind:this={video} playsinline muted></video>
</div>
{#if camera === 'attente'}
  <p class="discret">Ouverture de l'appareil photo…</p>
{:else if camera === 'indisponible'}
  <p class="note">L'appareil photo n'est pas disponible (permission refusée, ou pas de caméra). Prends le QR en photo, ou tape le code écrit dessous.</p>
{:else}
  <p class="discret petit">Vise le QR. L'appareil photo s'éteint dès que tu fermes cette fenêtre, et rien n'est enregistré.</p>
{/if}

<label class="bouton photo">
  Prendre le QR en photo
  <input id="scan-photo" type="file" accept="image/*" capture="environment" hidden onchange={photo} />
</label>

<form class="ligne" onsubmit={valider}>
  <input id="scan-texte" bind:value={texte} placeholder="ou tape / colle le code" autocomplete="off" aria-label="Code du QR" />
  <button class="encre">Valider</button>
</form>
{#if import.meta.env.VITE_DEMO}
  <p class="note">Démo : codes <b>COMMUNE-71</b>, <b>MUR-28-MAI</b> ou <b>18-MARS-2027</b>.</p>
{/if}

<button onclick={() => (ui.scanner = false)}>Fermer</button>

<style>
  .video { width: 100%; aspect-ratio: 1; background: var(--encre); border: 3px solid var(--encre); overflow: hidden; }
  .video.cachee { display: none; }
  video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo { flex-direction: row; justify-content: center; width: 100%; }
  form { width: 100%; }
  form input { flex: 1; min-width: 0; }
  .petit { font-size: 13px; text-align: center; }
  h2 { text-align: center; }
</style>
