<script lang="ts">
  // Application Android : elle ne se met pas à jour toute seule. On compare sa version à celle publiée sur le site.
  let etat = $state<'repos' | 'recherche' | 'a-jour' | 'disponible' | 'erreur'>('repos')
  let nouvelle = $state<{ version: number; fichier: string } | null>(null)
  const installee = import.meta.env.VITE_VERSION

  async function chercher() {
    etat = 'recherche'
    try {
      const r = await fetch(new URL('telecharger/version.json', import.meta.env.VITE_SITE), { cache: 'no-store' })
      if (!r.ok) throw new Error()
      const v = (await r.json()) as { version: number; fichier: string }
      nouvelle = v
      etat = Number(v.version) > Number(installee) ? 'disponible' : 'a-jour'
    } catch { etat = 'erreur' }
  }
</script>

<p><b>✓ Tu utilises l'application Android</b> (version {installee}). Elle fonctionne sans réseau.</p>
<p class="petit">Elle ne se met pas à jour toute seule : avec du réseau, vérifie de temps en temps s'il y a une nouvelle version. Ta collection est gardée.</p>
<div><button class="encre" disabled={etat === 'recherche'} onclick={chercher}>{etat === 'recherche' ? 'Recherche…' : "Chercher une mise à jour de l'app"}</button></div>
{#if etat === 'a-jour'}<p class="petit">Tu as déjà la dernière version.</p>
{:else if etat === 'erreur'}<p class="petit">Impossible de joindre le site. Il faut du réseau : réessaie à la maison.</p>
{:else if etat === 'disponible' && nouvelle}
  <p>Une nouvelle version est disponible (version {nouvelle.version}).</p>
  <p><a class="bouton rouge" href={new URL(nouvelle.fichier, import.meta.env.VITE_SITE).href} target="_blank" rel="noopener">Télécharger la mise à jour</a></p>
  <p class="petit">Ouvre le fichier téléchargé et installe-le : il remplace l'app sans effacer ta collection.</p>
{/if}

<style>
  .petit { font-size: 13px; color: var(--discret); }
  a.bouton.rouge { background: var(--rouge); border-color: var(--rouge); color: var(--sur-rouge); text-decoration: none; display: inline-block; }
</style>
