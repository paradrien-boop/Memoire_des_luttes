<script lang="ts">
  let { surtitre, titre, marque = '' }: { surtitre: string; titre: string; marque?: string } = $props()
</script>

<header>
  <div><div class="surtitre">{surtitre}</div><h1>{titre}</h1></div>
  {#if marque}<div class="marque">{marque}</div>{/if}
</header>

<style>
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 4px solid var(--encre); padding-bottom: 10px; margin-bottom: 22px; }
  .marque { font-family: var(--f-affiche); font-weight: 900; font-size: 15px; text-transform: uppercase; line-height: 1; color: var(--rouge); text-align: right; white-space: pre-line; }
</style>
