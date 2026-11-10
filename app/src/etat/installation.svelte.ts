// Installation de l'app sur l'écran d'accueil.

interface InviteInstallation extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type Systeme = 'ios' | 'android' | 'autre'

function estInstallee(): boolean {
  return matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function systeme(): Systeme {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'autre'
}

class Installation {
  installee = $state(estInstallee())
  /** Sur Android (Chrome, Edge, Samsung…), le navigateur permet un bouton « Installer ». */
  invite = $state<InviteInstallation | null>(null)
  systeme = systeme()

  constructor() {
    addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); this.invite = e as InviteInstallation })
    addEventListener('appinstalled', () => { this.installee = true; this.invite = null })
  }

  async installer() {
    if (!this.invite) return
    await this.invite.prompt()
    const { outcome } = await this.invite.userChoice
    if (outcome === 'accepted') this.installee = true
    this.invite = null
  }
}

export const installation = new Installation()

/**
 * Demande au navigateur de ne jamais effacer les données de l'app pour faire de la place.
 * Sans cela, une collection pourrait disparaître sur un téléphone presque plein.
 */
export async function protegerDonnees(): Promise<boolean> {
  try { return (await navigator.storage?.persisted?.()) || (await navigator.storage?.persist?.()) || false }
  catch { return false }
}
