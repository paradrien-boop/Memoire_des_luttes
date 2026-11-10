import { test, expect } from '@playwright/test'
import { encoderQr } from '../../paquets/noyau/src/index'
import { code, commencer } from './aide'

test('série complète : frise chronologique ; carte des idées', async ({ page }) => {
  const app = await commencer(page)
  for (const id of ['internationale', 'cerises', 'guerrecivile', 'anarchisme', 'louise']) {
    await code(page, encoderQr({ t: 'C', i: id, x: 'test-' + id }))
    await page.getByRole('button', { name: 'Fermer' }).click()
  }
  await page.goto('/#album')
  await expect(page.getByText('Série complète !')).toBeVisible()
  await page.getByRole('button', { name: 'Voir la frise chronologique' }).click()
  const titres = await page.locator('.frise .titre').allTextContents()
  // 1866, puis les deux cartes de 1871 (dans un ordre ou l'autre), puis la carte sans année.
  expect(titres[0]).toBe('Le Temps des cerises')
  expect(titres.slice(1, 3).sort()).toEqual(["L'Internationale", 'La Guerre civile en France'])
  expect(titres[3]).toBe("L'anarchisme")
  await expect(page.locator('.frise .annee').first()).toHaveText('1866')
  await page.getByRole('dialog', { name: 'Frise chronologique' }).getByRole('button', { name: 'Le Temps des cerises' }).click()
  await expect(page.locator('.carte h3')).toHaveText('Le Temps des cerises')
  await page.getByRole('button', { name: 'Fermer' }).click()

  const carte = page.getByRole('group', { name: /Carte des idées : 5 cartes/ })
  await expect(carte).toBeVisible()
  await expect(carte.locator('.cache').first()).toBeVisible()
  await carte.getByRole('button', { name: 'Louise Michel' }).click()
  await expect(page.locator('.carte h3')).toHaveText('Louise Michel')
  await page.getByRole('button', { name: 'Fermer' }).click()
  await app.verifierPropre()
})
