// La publication complète, telle qu'elle part sur Codeberg Pages : site à la racine, app sous /app/, packs sous /packs/.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const SITE = 'http://localhost:4176/'
test.describe.configure({ mode: 'parallel' })

function surveiller(page: import('@playwright/test').Page) {
  const erreurs: string[] = []
  const exterieur: string[] = []
  page.on('pageerror', (e) => erreurs.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()) })
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost') && !/^(data|blob):/.test(r.url())) exterieur.push(r.url()) })
  return { erreurs, exterieur }
}

test('le site : chaque page, sans erreur ni requête extérieure, accessible', async ({ page }) => {
  const s = surveiller(page)
  await page.goto(SITE)
  await expect(page.getByRole('heading', { level: 1, name: /Mémoire/ })).toBeVisible()
  await expect(page.getByRole('img', { name: "QR code vers l'app" })).toBeVisible()
  const pages: [string, RegExp][] = [['cartes', /Les cartes/], ['packs', /Packs/], ['collectifs', /Collectifs/], ['cles', /Clés/], ['participer', /Participer/], ['accueil', /Mémoire/]]
  for (const [id, titre] of pages) {
    await page.goto(SITE + '#' + id)
    await expect(page.getByRole('heading', { level: 1, name: titre })).toBeVisible()
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme })
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${id}/${theme} ${v.id} → ${v.nodes[0].target.join(' ')}`)
      expect(graves).toEqual([])
    }
  }
  expect(s.erreurs).toEqual([])
  expect(s.exterieur).toEqual([])
})

test('les cartes et les packs publiés', async ({ page, request }) => {
  await page.goto(SITE + '#cartes')
  await expect(page.locator('tbody tr')).toHaveCount(16)
  await page.getByRole('button', { name: /À relire/ }).click()
  await expect(page.locator('tbody tr').first()).toBeVisible()
  await page.goto(SITE + '#packs')
  const lien = page.getByRole('link', { name: 'Télécharger le pack' }).first()
  const pack = await (await request.get(new URL((await lien.getAttribute('href'))!, SITE).href)).json()
  expect(pack.cartes).toHaveLength(16)
  expect(pack.type).toBeUndefined()
  const index = await (await request.get(SITE + 'packs/index.json')).json()
  expect(index.packs[0]).toMatchObject({ id: 'commune-1871', fichier: 'packs/commune-1871.json' })
})

test("créer la clé d'un collectif dans le navigateur, sans rien envoyer", async ({ page }) => {
  const s = surveiller(page)
  const envois: string[] = []
  page.on('request', (r) => { if (r.method() !== 'GET') envois.push(r.url()) })
  await page.goto(SITE + '#cles')
  await page.locator('#c-id').fill('cgt-douarnenez')
  await page.locator('#c-nom').fill('CGT Douarnenez')
  await page.locator('#c-themes').fill('pêche, conserveries')
  await page.getByRole('button', { name: 'Créer la clé' }).click()
  await expect(page.getByText('Empreinte de votre clé')).toBeVisible()
  const telechargement = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Télécharger la clé secrète' }).click()
  const fichier = await telechargement
  expect(fichier.suggestedFilename()).toBe('cgt-douarnenez.cle-secrete.json')
  const demande = JSON.parse(await page.locator('#demande').inputValue())
  expect(demande).toMatchObject({ id: 'cgt-douarnenez', nom: 'CGT Douarnenez', themes: ['pêche', 'conserveries'] })
  expect(demande.clePublique).toMatch(/^[0-9a-f]{64}$/)
  expect(JSON.stringify(demande)).not.toContain('secrete')
  expect(envois).toEqual([])
  expect(s.erreurs).toEqual([])
})

test("l'app publiée sous /app/, et la recherche de packs sur le site", async ({ page }) => {
  const s = surveiller(page)
  await page.goto(SITE)
  await page.getByRole('link', { name: "Ouvrir l'app" }).first().click()
  await expect(page).toHaveURL(/\/app\/$/)
  await page.getByRole('button', { name: "C'est parti" }).click()
  await page.goto(SITE + 'app/#plus')
  await page.getByRole('button', { name: 'Chercher de nouveaux packs' }).click()
  await expect(page.getByText('Tu as déjà tous les packs signés du site.')).toBeVisible()
  // L'app publiée n'accepte pas la clé de démonstration ni les codes de démo.
  await expect(page.getByText('Version de démonstration')).toHaveCount(0)
  await page.goto(SITE + 'app/#manif')
  await page.locator('#code-stand').fill('COMMUNE-71')
  await page.locator('#code-stand').press('Enter')
  await expect(page.getByText('ne vient pas de Mémoire des luttes')).toBeVisible()
  expect(s.erreurs).toEqual([])
  expect(s.exterieur).toEqual([])
})
