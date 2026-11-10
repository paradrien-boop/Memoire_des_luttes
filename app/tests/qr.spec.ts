import { test, expect } from '@playwright/test'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import QRCode from 'qrcode'
import { encoderQr, genererCles, type QrStand } from '../../paquets/noyau/src/index'
import { aujourdhui, code, commencer, qrSigne, rangerBooster } from './aide'

test.describe.configure({ mode: 'parallel' })

const stand = (x: Partial<QrStand> = {}): QrStand => ({ t: 'S', i: 'stand-' + Math.random().toString(36).slice(2), m: 'legendaire', du: aujourdhui(), au: aujourdhui(), ...x })

test('QR de stand signé : accepté une fois, refusé s\'il est modifié, périmé ou d\'une clé inconnue', async ({ page }) => {
  const app = await commencer(page)
  const s = stand()
  const texte = qrSigne(s)
  await code(page, texte)
  await page.getByRole('button', { name: 'Tout retourner' }).click()
  await expect(page.locator('.revelation .r-legendaire').first()).toBeVisible()
  await rangerBooster(page)

  await code(page, texte)
  await expect(page.getByText('déjà été utilisé')).toBeVisible()

  const signature = texte.split('.')[1]
  await code(page, encoderQr({ ...s, i: 'autre' }) + '.' + signature)
  await expect(page.getByText('La signature de ce QR est fausse')).toBeVisible()

  await code(page, qrSigne(stand({ du: '2000-01-01', au: '2000-01-02' })))
  await expect(page.getByText("n'est plus valable")).toBeVisible()

  await code(page, qrSigne(stand(), genererCles().secrete))
  await expect(page.getByText('La signature de ce QR est fausse')).toBeVisible()

  await code(page, 'https://exemple.org')
  await expect(page.getByText('ne vient pas de Mémoire des luttes')).toBeVisible()
  await app.verifierPropre()
})

test("carte d'événement reçue dans le QR, même inconnue de l'app", async ({ page }) => {
  const app = await commencer(page)
  await code(page, qrSigne({ t: 'E', e: 'ev-test', n: 42, du: aujourdhui(), au: aujourdhui(), k: { title: 'Grève générale', dates: 'Un jour de lutte', fait: 'Tout le monde dans la rue.', tirage: 300 } }))
  await expect(page.locator('.carte h3')).toHaveText('Grève générale')
  await expect(page.locator('.numero')).toHaveText('N° 0042 / 300')
  await page.getByRole('button', { name: 'Fermer' }).click()
  await page.goto('/#album')
  await expect(page.getByRole('button', { name: 'Grève générale' })).toBeVisible()
  await page.reload()
  await page.goto('/#album')
  await expect(page.getByRole('button', { name: 'Grève générale' })).toBeVisible()
  await app.verifierPropre()
})

test('scanner : lire un QR sur une photo', async ({ page }) => {
  const app = await commencer(page)
  const dossier = mkdtempSync(join(tmpdir(), 'mdl-'))
  const fichier = join(dossier, 'qr.png')
  writeFileSync(fichier, await QRCode.toBuffer(qrSigne(stand({ m: 'rare' })), { width: 500, margin: 4 }))
  await page.getByRole('button', { name: 'Scanner un QR' }).click()
  await expect(page.getByRole('dialog', { name: 'Scanner un QR' })).toBeVisible()
  await page.locator('#scan-photo').setInputFiles(fichier)
  await expect(page.getByText('Touche les cartes pour les retourner')).toBeVisible()
  await app.verifierPropre()
})

test('donner une carte en double, et la recevoir sur un autre téléphone', async ({ page, browser }) => {
  const app = await commencer(page)
  // Deux exemplaires de Louise Michel, reçus de camarades.
  for (const x of ['a1', 'a2']) {
    await code(page, encoderQr({ t: 'C', i: 'louise', x }))
    await expect(page.getByText('Carte reçue : Louise Michel')).toBeVisible()
    await page.getByRole('button', { name: 'Fermer' }).click()
  }
  await page.goto('/#album')
  await page.getByRole('button', { name: 'Louise Michel' }).click()
  await page.getByRole('button', { name: /Donner un exemplaire \(2/ }).click()
  await expect(page.getByRole('img', { name: 'QR pour donner cette carte' })).toBeVisible()
  await page.getByRole('button', { name: "C'est fait, je l'ai donnée" }).click()
  await expect(page.getByText('Carte donnée')).toBeVisible()
  await page.getByRole('button', { name: 'Louise Michel' }).click()
  await expect(page.getByRole('button', { name: /Donner un exemplaire/ })).toHaveCount(0)

  // L'autre téléphone reçoit le don.
  const autre = await (await browser.newContext({ viewport: { width: 400, height: 860 } })).newPage()
  await commencer(autre)
  await code(autre, encoderQr({ t: 'C', i: 'varlin', x: 'don-1' }))
  await expect(autre.getByText('Carte reçue : Eugène Varlin')).toBeVisible()
  await autre.getByRole('button', { name: 'Fermer' }).click()
  await code(autre, encoderQr({ t: 'C', i: 'varlin', x: 'don-1' }))
  await expect(autre.getByText('déjà été utilisé')).toBeVisible()
  await code(autre, encoderQr({ t: 'C', i: 'carte-inconnue', x: 'don-2' }))
  await expect(autre.getByText('ne connaît pas encore cette carte')).toBeVisible()
  await app.verifierPropre()
})

test('partager une carte perso par QR', async ({ page }) => {
  const app = await commencer(page)
  await page.goto('/#editeur')
  await page.locator('#e-title').fill('Grève des Penn Sardin')
  await page.locator('#e-fait').fill('En 1924, les sardinières de Douarnenez font grève pendant six semaines et gagnent.')
  await page.getByRole('button', { name: 'Enregistrer la carte' }).click()
  await page.goto('/#album')
  await page.getByRole('button', { name: 'Grève des Penn Sardin' }).click()
  await page.getByRole('button', { name: 'Partager par QR' }).click()
  await expect(page.getByRole('img', { name: 'QR de ta carte perso' })).toBeVisible()
  await page.getByRole('button', { name: 'Fermer' }).click()

  await code(page, encoderQr({ t: 'P', x: 'p1', carte: { fam: 'chant', rar: 'base', title: 'Bella Ciao', fait: 'Chant des partisans.' } }))
  await expect(page.getByText('Carte perso reçue : Bella Ciao')).toBeVisible()
  await page.getByRole('button', { name: 'Fermer' }).click()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Cartes reçues' })).toBeVisible()
  await app.verifierPropre()
})
