import { test, expect } from '@playwright/test'
import { encoderQr } from '../../paquets/noyau/src/index'
import { code, commencer, qrSigne, aujourdhui, rangerBooster } from './aide'

test("équipement : choisir l'objet de chaque emplacement ; un pouvoir ne sert que s'il est porté", async ({ page }) => {
  const app = await commencer(page)
  // Deux chants (porte-voix) et une personnalité (foulard rouge).
  for (const id of ['internationale', 'cerises', 'louise', 'commune']) {
    await code(page, encoderQr({ t: 'C', i: id, x: 'e-' + id }))
    await page.getByRole('button', { name: 'Fermer' }).click()
  }
  await page.goto('/#plus')
  const mainDroite = page.getByRole('radiogroup', { name: 'Main droite' })
  // Débloqué et porté d'office
  await expect(mainDroite.getByRole('radio', { name: /le porte-voix/ })).toHaveAttribute('aria-checked', 'true')
  // Un objet verrouillé explique comment le débloquer
  await mainDroite.getByRole('radio', { name: /le drapeau rouge/ }).click({ force: true }) // verrouillé : le clic affiche comment le débloquer
  await expect(page.getByText(/À débloquer : 1 carte différente de la famille « Courant de pensée »/)).toBeVisible()
  await expect(mainDroite.getByRole('radio', { name: /le drapeau rouge/ })).toHaveAttribute('aria-checked', 'false')

  // Avec le porte-voix porté, son pouvoir est proposé en bataille
  await page.goto('/#quartier')
  await page.locator('#nom-chat').fill('Sabot')
  await page.getByRole('button', { name: "C'est son nom" }).click()
  await expect(page.getByRole('button', { name: /Porte-voix/ })).toBeVisible()

  // On le retire : plus de pouvoir, et le choix est gardé
  await page.goto('/#plus')
  await mainDroite.getByRole('radio', { name: 'Rien' }).click()
  await expect(mainDroite.getByRole('radio', { name: 'Rien' })).toHaveAttribute('aria-checked', 'true')
  await page.waitForTimeout(300)
  await page.reload()
  await page.goto('/#plus')
  await expect(page.getByRole('radiogroup', { name: 'Main droite' }).getByRole('radio', { name: 'Rien' })).toHaveAttribute('aria-checked', 'true')
  await page.goto('/#quartier')
  await expect(page.locator('.arene')).toBeVisible()
  await expect(page.getByRole('button', { name: /Porte-voix/ })).toHaveCount(0)

  // Le col porte le foulard rouge (débloqué avec Louise Michel)
  await page.goto('/#plus')
  await expect(page.getByRole('radiogroup', { name: 'Col' }).getByRole('radio', { name: /le foulard rouge/ })).toHaveAttribute('aria-checked', 'true')
  await app.verifierPropre()
})

test('au plus 9 cartes par jour : les boosters attendent, le booster spécial du stand est gardé', async ({ page }) => {
  const app = await commencer(page)
  await page.getByRole('button', { name: 'Ouvrir un booster' }).click()
  await rangerBooster(page)
  for (const c of ['COMMUNE-71', 'MUR-28-MAI']) { await code(page, c); await rangerBooster(page) }
  await expect(page.getByText(/Aujourd'hui : 9 \/ 9 cartes/)).toBeVisible()

  // Un stand de plus : le booster spécial est gardé pour demain
  await code(page, qrSigne({ t: 'S', i: 'stand-limite', m: 'rare', du: aujourdhui(), au: aujourdhui() }))
  await expect(page.getByText('Limite de cartes du jour atteinte')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Boosters spéciaux gardés' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ouvrir', exact: true })).toBeDisabled()

  // Les boosters gagnés autrement attendent aussi : on en gagne un (adhésion), il ne s'ouvre pas aujourd'hui
  await page.goto('/#plus')
  await page.getByLabel(/Rejoindre une organisation/).check()
  await page.getByRole('button', { name: 'Enregistrer mes actions' }).click()
  await page.goto('/#manif')
  await page.locator('li').filter({ hasText: 'Rejoindre une organisation' }).getByRole('button', { name: "Je l'ai fait" }).click()
  await expect(page.getByRole('button', { name: 'Ouvrir un booster' })).toBeDisabled()
  await expect(page.locator('.enveloppe')).toHaveText('×2')

  // Le lendemain, tout peut s'ouvrir : on simule en vieillissant le compteur du jour
  await page.evaluate(() => new Promise<void>((ok) => {
    const r = indexedDB.open('memoire-des-luttes')
    r.onsuccess = () => { const tx = r.result.transaction('reglages', 'readwrite'); tx.objectStore('reglages').put({ cle: 'cartesJour', valeur: { date: '2000-01-01', n: 9 } }); tx.oncomplete = () => ok() }
  }))
  await page.reload()
  await page.goto('/#manif')
  await expect(page.getByText(/Aujourd'hui : 0 \/ 9 cartes/)).toBeVisible()
  await page.getByRole('button', { name: 'Ouvrir', exact: true }).click()
  await expect(page.getByText('Touche les cartes pour les retourner')).toBeVisible()
  await app.verifierPropre()
})
