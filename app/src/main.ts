import { mount } from 'svelte'
import './styles/polices.css'
import './styles/jetons.css'
import './styles/base.css'
import App from './App.svelte'

const app = mount(App, { target: document.getElementById('app')! })

// Application Android : le bouton retour ferme d'abord la fenêtre ouverte, puis revient à l'écran Manif,
// puis réduit l'app (sans la quitter, pour ne pas interrompre le compteur de manif).
if (import.meta.env.VITE_ANDROID) {
  Promise.all([import('@capacitor/app'), import('./etat/interface.svelte')]).then(([{ App: Capacitor }, { ui }]) => {
    Capacitor.addListener('backButton', () => {
      if (ui.booster || ui.carteOuverte || ui.scanner || ui.qr || ui.frise) ui.fermer()
      else if (location.hash && location.hash !== '#manif') location.hash = '#manif'
      else Capacitor.minimizeApp()
    })
  })
}

export default app
