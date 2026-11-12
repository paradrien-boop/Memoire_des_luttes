import { test, expect } from '@playwright/test'
import { code, commencer, lireTable, rangerBooster } from './aide'

interface Quiz { date: string; questions: { bonne: number }[] }

test('quiz du jour, chat nommé, quartier, fragment de booster', async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#quartier')
  await expect(page.getByText('Les batailles commencent quand tu as')).toBeVisible()
  await page.locator('#nom-chat').fill('Varlinette')
  await page.getByRole('button', { name: "C'est son nom" }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Varlinette' })).toBeVisible()

  await page.goto('/#manif')
  await page.getByRole('button', { name: 'Ouvrir un booster' }).click()
  await rangerBooster(page)
  for (const c of ['COMMUNE-71', 'MUR-28-MAI']) { await code(page, c); await rangerBooster(page) }

  await page.goto('/#quartier')
  await expect(page.getByText('Bataille 1 sur 3')).toBeVisible()
  const enonce = await page.locator('.enonce').textContent()
  await page.reload()
  await page.goto('/#quartier')
  await expect(page.locator('.enonce')).toHaveText(enonce!)

  const [q] = await lireTable<Quiz>(page, 'quiz')
  await page.locator('.choix-bouton').nth(q.questions[0].bonne).click()
  await expect(page.getByText(/^Bataille gagnée !/)).toBeVisible()
  await page.getByRole('button', { name: 'Bataille suivante' }).click()
  await page.locator('.choix-bouton').nth((q.questions[1].bonne + 1) % 4).click()
  // Avec une banderole (cartes « Événement »), une seconde chance est proposée : on accepte la défaite.
  const defaite = page.getByRole('button', { name: 'Accepter la défaite' })
  if (await defaite.isVisible().catch(() => false)) await defaite.click()
  await expect(page.getByText('Bataille perdue')).toBeVisible()
  await page.getByRole('button', { name: 'Bataille suivante' }).click()
  await page.locator('.choix-bouton').nth(q.questions[2].bonne).click()
  await page.getByRole('button', { name: 'Voir le bilan' }).click()
  await expect(page.locator('.bilan')).toHaveText('2/3')
  // Deux batailles gagnées : au moins 20 points (plus le bonus des objets gagnés).
  const points = Number((await page.locator('.progression .surtitre').textContent())!.match(/(\d+) points/)![1])
  expect(points).toBeGreaterThanOrEqual(20)
  await expect(page.getByRole('heading', { name: 'Batailles terminées' })).toBeVisible()

  // Un autre jour, sans faute : un fragment de booster.
  await page.evaluate(() => new Promise<void>((ok) => {
    const r = indexedDB.open('memoire-des-luttes')
    r.onsuccess = () => { const tx = r.result.transaction('quiz', 'readwrite'); const s = tx.objectStore('quiz'); const g = s.getAll(); g.onsuccess = () => { const d = g.result[0]; s.delete(d.date); d.date = '2000-01-01'; s.put(d) }; tx.oncomplete = () => ok() }
  }))
  await page.reload()
  await page.goto('/#quartier')
  for (let i = 0; i < 3; i++) {
    const jour = (await lireTable<Quiz>(page, 'quiz')).find((x) => x.date !== '2000-01-01')!
    await page.locator('.choix-bouton').nth(jour.questions[i].bonne).click()
    await page.getByRole('button', { name: i < 2 ? 'Bataille suivante' : 'Voir le bilan' }).click()
  }
  await expect(page.getByText('Sans faute')).toBeVisible()
  await expect(page.locator('.fragments span.plein')).toHaveCount(1)
  await app.verifierPropre()
})
