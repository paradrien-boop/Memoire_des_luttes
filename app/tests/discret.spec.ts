import { test, expect, type Page } from '@playwright/test'
import { commencer } from './aide'

async function taper(page: Page, code: string) {
  for (const c of code) await page.getByRole('button', { name: c, exact: true }).click()
  await page.getByRole('button', { name: 'Valider' }).click()
}

test("mode discret : code d'ouverture, écran neutre, reverrouillage", async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#plus')
  await page.locator('#code-1').fill('2468')
  await page.locator('#code-2').fill('2469')
  await page.getByRole('button', { name: 'Activer le code' }).click()
  await expect(page.getByText('Les deux codes sont différents.')).toBeVisible()
  await page.locator('#code-2').fill('2468')
  await page.getByRole('button', { name: 'Activer le code' }).click()
  await expect(page.getByText("✓ Le code d'ouverture est activé.")).toBeVisible()

  // Le code n'est jamais enregistré en clair.
  const reglage = await page.evaluate(() => new Promise<string>((ok) => {
    const r = indexedDB.open('memoire-des-luttes')
    r.onsuccess = () => { const g = r.result.transaction('reglages').objectStore('reglages').get('verrou'); g.onsuccess = () => ok(JSON.stringify(g.result)) }
  }))
  expect(reglage).not.toContain('2468')

  await page.getByRole('button', { name: 'Verrouiller maintenant' }).click()
  await expect(page.getByRole('dialog', { name: 'Code' })).toBeVisible()
  await expect(page).toHaveTitle('Code')
  await expect(page.getByText('Mode discret')).toHaveCount(0)

  await taper(page, '1111')
  await expect(page.getByText('Code incorrect.')).toBeVisible()
  await taper(page, '2468')
  await expect(page.getByRole('dialog', { name: 'Code' })).toHaveCount(0)
  await expect(page).toHaveTitle('Mémoire des luttes')

  await page.reload()
  await expect(page.getByRole('dialog', { name: 'Code' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Je manifeste' })).toHaveCount(0)
  for (let i = 0; i < 5; i++) await taper(page, '0000')
  await expect(page.getByText(/Réessaie dans \d+ s/)).toBeVisible()

  await page.reload()
  await taper(page, '2468')
  await page.goto('/#plus')
  await page.getByRole('button', { name: 'Retirer le code' }).click()
  await expect(page.getByText("Code d'ouverture retiré.")).toBeVisible()
  await page.reload()
  await page.goto('/#manif')
  await expect(page.getByRole('dialog', { name: 'Code' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Je manifeste' })).toBeVisible()
  await app.verifierPropre()
})
