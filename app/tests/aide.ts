// Outils communs aux tests de bout en bout.
import { expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { encoderQr, type ContenuQr } from '../../paquets/noyau/src/index'

/** La clé de démonstration, acceptée par la version de test de l'app. */
export const DEMO = JSON.parse(readFileSync(new URL('../../data/cles/demo.json', import.meta.url), 'utf8')) as { publique: string; secrete: string }

export const aujourdhui = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export const qrSigne = (contenu: ContenuQr, secrete = DEMO.secrete) => encoderQr(contenu, secrete)

/** Ouvre l'app et passe l'écran d'accueil. Relève les erreurs et les requêtes vers l'extérieur. */
export async function commencer(page: Page) {
  const erreurs: string[] = []
  const exterieur: string[] = []
  page.on('pageerror', (e) => erreurs.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()) })
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) exterieur.push(r.url()) })
  await page.goto('/')
  await page.getByRole('button', { name: "C'est parti" }).click()
  await expect(page.getByText('1 booster à ouvrir')).toBeVisible()
  return {
    async verifierPropre() {
      expect(erreurs, 'erreurs dans la console').toEqual([])
      expect(exterieur, "requêtes vers l'extérieur").toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'défilement horizontal').toBeLessThanOrEqual(400)
    },
  }
}

/** Tape un code dans l'écran Manif. */
export async function code(page: Page, texte: string) {
  await page.goto('/#manif')
  await page.locator('#code-stand').fill(texte)
  await page.locator('#code-stand').press('Enter')
}

export async function rangerBooster(page: Page) {
  await page.getByRole('button', { name: "Ranger dans l'album" }).click()
}

/** Lit une table de la base du téléphone. */
export function lireTable<T = unknown>(page: Page, table: string): Promise<T[]> {
  return page.evaluate((t) => new Promise<T[]>((ok) => {
    const req = indexedDB.open('memoire-des-luttes')
    req.onsuccess = () => { const g = req.result.transaction(t).objectStore(t).getAll(); g.onsuccess = () => ok(g.result as T[]) }
  }), table)
}
