import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { code, commencer, rangerBooster } from './aide'

/** Problèmes d'accessibilité graves ou critiques sur la page affichée. */
async function problemes(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} (${v.nodes.length}) : ${v.help} → ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
}

for (const theme of ['light', 'dark'] as const) {
  test(`accessibilité de chaque écran, thème ${theme === 'light' ? 'clair' : 'sombre'}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await commencer(page)
    for (const c of ['COMMUNE-71', 'MUR-28-MAI']) { await code(page, c); await rangerBooster(page) }
    const trouves: string[] = []
    for (const ecran of ['manif', 'album', 'quartier', 'editeur', 'plus']) {
      await page.goto('/#' + ecran)
      await page.waitForTimeout(300)
      trouves.push(...(await problemes(page)).map((p) => `[${ecran}] ${p}`))
    }
    await page.goto('/#album')
    await page.locator('.serie .grille button.mini').first().click()
    trouves.push(...(await problemes(page)).map((p) => `[carte] ${p}`))
    expect(trouves).toEqual([])
  })
}
