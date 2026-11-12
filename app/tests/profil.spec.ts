import { test, expect } from '@playwright/test'
import { commencer, lireTable } from './aide'

test('profil : personnage créé une fois et enregistré tel quel', async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#quartier')
  await expect(page.getByText('Crée ton personnage dans ton')).toBeVisible()
  await page.goto('/#plus')
  await page.getByRole('button', { name: 'Enregistrer mon personnage' }).click()
  await expect(page.getByText('Donne un nom à ton personnage.')).toBeVisible()
  await page.locator('#perso-nom').fill('Camille')
  await page.getByRole('radio', { name: 'Teint 3' }).click()
  await page.getByRole('radio', { name: 'Frisée' }).click()
  await page.getByRole('button', { name: 'Enregistrer mon personnage' }).click()
  await expect(page.getByText('Personnage enregistré.')).toBeVisible()
  await expect(page.locator('#personnage .nom')).toHaveText('Camille')

  await page.waitForTimeout(300)
  await page.reload()
  await page.goto('/#plus')
  await expect(page.locator('#personnage .nom')).toHaveText('Camille')
  await page.getByRole('button', { name: 'Modifier mon personnage' }).click()
  await expect(page.getByRole('radio', { name: 'Teint 3' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('radio', { name: 'Frisée' })).toHaveAttribute('aria-checked', 'true')
  await page.goto('/#quartier')
  await expect(page.getByText('Crée ton personnage dans ton')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Camille' })).toBeVisible()
  await app.verifierPropre()
})

test('actions militantes : choisir, déclarer, plafonds, objectif de la semaine, sans historique', async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#manif')
  await expect(page.getByText('Choisis les actions que tu te sens de mener')).toBeVisible()

  await page.goto('/#plus')
  for (const nom of ['Distribuer des tracts', 'Lire un texte de lutte', 'Rejoindre une organisation']) await page.getByLabel(new RegExp(nom)).check()
  await page.locator('#objectif').selectOption('2')
  await page.getByRole('button', { name: 'Enregistrer mes actions' }).click()
  await expect(page.getByText('Tes actions sont enregistrées.')).toBeVisible()

  await page.goto('/#manif')
  const actions = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Mes actions' }) })
  await expect(actions.locator('li')).toHaveCount(3)
  await expect(actions.getByText('0 / 2')).toBeVisible()

  // Tracter : 2 fragments, une fois par jour
  const tracts = actions.locator('li').filter({ hasText: 'Distribuer des tracts' })
  await tracts.getByRole('button', { name: "Je l'ai fait" }).click()
  await expect(page.getByText('Bravo ! +2 fragments.')).toBeVisible()
  await expect(tracts.getByRole('button', { name: "Fait aujourd'hui ✓" })).toBeDisabled()

  // Lire : l'objectif de 2 actions est atteint, 1 booster en plus
  const boostersAvant = Number((await page.locator('.enveloppe').textContent())!.replace('×', ''))
  await actions.locator('li').filter({ hasText: 'Lire un texte de lutte' }).getByRole('button', { name: "Je l'ai fait" }).click()
  await expect(page.getByText('Objectif de la semaine atteint !')).toBeVisible()
  await expect(actions.getByText('2 / 2')).toBeVisible()
  await expect(page.locator('.enveloppe')).toHaveText('×' + (boostersAvant + 1))

  // Adhérer : 2 boosters, une seule fois
  await actions.locator('li').filter({ hasText: 'Rejoindre une organisation' }).getByRole('button', { name: "Je l'ai fait" }).click()
  await expect(page.locator('.enveloppe')).toHaveText('×' + (boostersAvant + 3))
  await expect(actions.locator('li').filter({ hasText: 'Rejoindre une organisation' }).getByRole('button', { name: 'Fait ✓' })).toBeDisabled()

  // Gardé après rechargement ; aucun historique daté
  await page.waitForTimeout(300)
  await page.reload()
  await page.goto('/#manif')
  await expect(tracts.getByRole('button', { name: "Fait aujourd'hui ✓" })).toBeDisabled()
  const reglages = await lireTable<{ cle: string; valeur: unknown }>(page, 'reglages')
  const compteurs = JSON.stringify(reglages.find((r) => r.cle === 'compteursActions')!.valeur)
  const d = new Date()
  const hier = new Date(d.getTime() - 86_400_000)
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  expect(compteurs).not.toContain(iso(hier))
  expect(compteurs.match(/\d{4}-\d{2}-\d{2}/g) ?? []).toHaveLength(1) // seulement le jour en cours
  await app.verifierPropre()
})
