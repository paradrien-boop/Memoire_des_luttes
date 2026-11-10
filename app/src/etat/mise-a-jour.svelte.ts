// Mode hors ligne et mises à jour de l'app.
// Le service worker garde toute l'app sur le téléphone. Quand une nouvelle version est publiée,
// il la télécharge (seulement si le téléphone a du réseau) et l'app propose de redémarrer.
import { registerSW } from 'virtual:pwa-register'

class MiseAJour {
  disponible = $state(false)
  /** L'app est prête à fonctionner sans réseau. */
  horsLignePret = $state(false)
  private appliquer: ((recharger?: boolean) => Promise<void>) | null = null

  demarrer() {
    if (!('serviceWorker' in navigator)) return
    this.appliquer = registerSW({
      onNeedRefresh: () => { this.disponible = true },
      onOfflineReady: () => { this.horsLignePret = true },
      onRegisteredSW: (_url, inscription) => { if (inscription?.active) this.horsLignePret = true },
    })
  }

  async redemarrer() {
    await this.appliquer?.(true)
  }
}

export const miseAJour = new MiseAJour()
