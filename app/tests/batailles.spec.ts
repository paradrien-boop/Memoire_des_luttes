import { test, expect } from '@playwright/test'
import { encoderQr } from '../../paquets/noyau/src/index'
import { code, commencer, lireTable } from './aide'

interface Quiz { date: string; questions: { bonne: number; choix: string[] }[] }

test('batailles : adversaire, porte-voix, seconde chance avec la banderole, personnage équipé', async ({ page }) => {
  const app = await commencer(page)
  // Deux chants (porte-voix niveau 1) et trois événements (banderole niveau 2).
  for (const id of ['internationale', 'cerises', 'commune', '18mars', 'semaine', 'louise']) {
    await code(page, encoderQr({ t: 'C', i: id, x: 'b-' + id }))
    await page.getByRole('button', { name: 'Fermer' }).click()
  }
  await page.goto('/#quartier')
  await page.locator('#nom-chat').fill('Sabot')
  await page.getByRole('button', { name: "C'est son nom" }).click()

  // L'arène et l'adversaire du jour
  await expect(page.getByRole('img', { name: /^Bataille contre / })).toBeVisible()
  await expect(page.locator('.bulle')).toBeVisible()

  // Le porte-voix fait taire une mauvaise réponse
  await expect(page.locator('.choix-bouton')).toHaveCount(4)
  await page.getByRole('button', { name: /Porte-voix \(1\)/ }).click()
  await expect(page.locator('.choix-bouton')).toHaveCount(3)
  await expect(page.getByRole('button', { name: /Porte-voix \(0\)/ })).toBeDisabled()

  // Une erreur : la banderole propose une seconde chance, puis on gagne
  const [q] = await lireTable<Quiz>(page, 'quiz')
  const bonne = q.questions[0].choix[q.questions[0].bonne]
  await page.locator('.choix-bouton').filter({ hasNotText: bonne }).first().click()
  await page.getByRole('button', { name: /Brandir la banderole \(2\)/ }).click()
  await page.locator('.choix-bouton').filter({ hasText: bonne }).click()
  await expect(page.getByText(/^Bataille gagnée !/)).toBeVisible()
  await expect(page.getByText('POUF !')).toBeVisible()

  // Le personnage : objets gagnés, apparence choisie et gardée
  await expect(page.locator('.objets li.gagne')).toHaveCount(3) // porte-voix, banderole, foulard rouge
  await page.getByRole('radio', { name: 'Teint 3' }).click()
  await page.getByRole('radio', { name: 'Frisée' }).click()
  await expect(page.getByRole('radio', { name: 'Frisée' })).toHaveAttribute('aria-checked', 'true')
  await page.waitForTimeout(300) // laisser l'enregistrement se terminer avant de recharger
  await page.reload()
  await page.goto('/#quartier')
  await expect(page.getByRole('radio', { name: 'Teint 3' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('radio', { name: 'Frisée' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('1 bataille gagnée')).toBeVisible()
  await app.verifierPropre()
})
