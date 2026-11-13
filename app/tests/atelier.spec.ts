import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const svg = (contenu: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -170 120 180">${contenu}</svg>`)
const deposer = (page: Page, fichiers: { name: string; buffer: Buffer }[]) =>
  page.setInputFiles('input[type=file]', fichiers.map((f) => ({ ...f, mimeType: 'image/svg+xml' })))

test("l'atelier de dessin montre les fichiers déposés dans les scènes, et refuse les fichiers invalides", async ({ page }) => {
  await page.goto('/atelier.html')
  await expect(page.getByRole('heading', { name: 'Atelier de dessin' })).toBeVisible()
  await page.getByRole('tab', { name: 'Bataille' }).click()
  await page.getByRole('button', { name: 'Censeur' }).click()
  const arene = page.getByRole('img', { name: 'Bataille contre Censeur' })
  await expect(arene.locator('image')).toHaveCount(0) // dessin en code

  await deposer(page, [
    { name: 'censeur.svg', buffer: svg('<rect x="-40" y="-150" width="80" height="150" fill="#1a8f3a"/>') },
    { name: 'soldat.svg', buffer: svg('<script>alert(1)</script>') },
    { name: 'croquis.svg', buffer: svg('') },
  ])
  await expect(page.getByText('✓ remplace ennemis/censeur')).toBeVisible()
  await expect(page.getByText(/contient du script/)).toBeVisible()
  await expect(page.getByText(/nom non reconnu/)).toBeVisible()
  await expect(arene.locator('image')).toHaveCount(1)

  // Comparer : retour au dessin d'origine
  await page.getByLabel(/Comparer/).check()
  await expect(arene.locator('image')).toHaveCount(0)
  await page.getByLabel(/Comparer/).uncheck()

  await page.getByRole('tab', { name: 'Dessins attendus' }).click()
  await expect(page.locator('li.depose')).toHaveText(/ennemis\/censeur/)

  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([])
})
