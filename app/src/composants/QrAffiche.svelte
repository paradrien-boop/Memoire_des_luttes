<script lang="ts">
  import QRCode from 'qrcode'
  let { texte, legende }: { texte: string; legende: string } = $props()
  let image = $state('')
  $effect(() => {
    QRCode.toDataURL(texte, { errorCorrectionLevel: 'M', margin: 2, width: 640, color: { dark: '#1C1816', light: '#FFFFFF' } }).then((u) => (image = u))
  })
</script>

<figure>
  {#if image}<img src={image} alt={legende} />{/if}
  <figcaption>{legende}</figcaption>
</figure>

<style>
  figure { margin: 0; width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
  img { width: 100%; height: auto; image-rendering: pixelated; border: 3px solid var(--encre); background: #fff; }
  figcaption { font-size: 13px; color: var(--discret); text-align: center; }
</style>
