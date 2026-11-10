import { test, expect } from '@playwright/test'

test('mode avion : l\'app se recharge et garde la collection', async ({ page, context }) => {
  const erreurs: string[] = []
  page.on('pageerror', (e) => erreurs.push(e.message))
  await page.goto('/')
  await expect(page.getByText('Prête à fonctionner sans réseau')).toBeVisible({ timeout: 20_000 })
  const manifeste = await page.evaluate(() => fetch('./manifest.webmanifest').then((r) => r.json()))
  expect(manifeste).toMatchObject({ name: 'Mémoire des luttes', display: 'standalone' })
  await page.getByRole('button', { name: "C'est parti" }).click()
  await page.getByRole('button', { name: 'Ouvrir un booster' }).click()
  await page.getByRole('button', { name: "Ranger dans l'album" }).click()

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Je manifeste' })).toBeVisible()
  expect(await page.evaluate(() => document.fonts.check('900 20px "Big Shoulders Display"'))).toBe(true)
  await page.goto('/#album')
  await expect(page.locator('.serie .grille button.mini').first()).toBeVisible()
  await page.goto('/#quartier')
  await expect(page.locator('svg[role="img"]')).toBeVisible()
  const autre = await context.newPage()
  await autre.goto('/#editeur')
  await expect(autre.locator('#e-title')).toBeVisible()
  await context.setOffline(false)
  expect(erreurs).toEqual([])
})
