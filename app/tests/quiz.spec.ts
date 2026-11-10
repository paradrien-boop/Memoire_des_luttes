import { test, expect } from '@playwright/test'
import { code, commencer, lireTable, rangerBooster } from './aide'

interface Quiz { date: string; questions: { bonne: number }[] }

test('quiz du jour, chat nommé, quartier, fragment de booster', async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#quartier')
  await expect(page.getByText('Le quiz commence quand tu as')).toBeVisible()
  await page.locator('#nom-chat').fill('Varlinette')
  await page.getByRole('button', { name: "C'est son nom" }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Varlinette' })).toBeVisible()

  await page.goto('/#manif')
  await page.getByRole('button', { name: 'Ouvrir un booster' }).click()
  await rangerBooster(page)
  for (const c of ['COMMUNE-71', 'MUR-28-MAI']) { await code(page, c); await rangerBooster(page) }

  await page.goto('/#quartier')
  await expect(page.getByText('Question 1 sur 3')).toBeVisible()
  const enonce = await page.locator('.enonce').textContent()
  await page.reload()
  await page.goto('/#quartier')
  await expect(page.locator('.enonce')).toHaveText(enonce!)

  const [q] = await lireTable<Quiz>(page, 'quiz')
  await page.locator('.choix-bouton').nth(q.questions[0].bonne).click()
  await expect(page.getByText('Juste !')).toBeVisible()
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await page.locator('.choix-bouton').nth((q.questions[1].bonne + 1) % 4).click()
  await expect(page.getByText('Raté. La bonne réponse')).toBeVisible()
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await page.locator('.choix-bouton').nth(q.questions[2].bonne).click()
  await page.getByRole('button', { name: 'Voir le bilan' }).click()
  await expect(page.locator('.bilan')).toHaveText('2/3')
  await expect(page.getByText('20 points')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quiz terminé' })).toBeVisible()

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
    await page.getByRole('button', { name: i < 2 ? 'Question suivante' : 'Voir le bilan' }).click()
  }
  await expect(page.getByText('Sans faute')).toBeVisible()
  await expect(page.locator('.fragments span.plein')).toHaveCount(1)
  await app.verifierPropre()
})
