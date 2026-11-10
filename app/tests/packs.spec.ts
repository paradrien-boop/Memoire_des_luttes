import { test, expect, type Page } from '@playwright/test'
import { deleguer, genererCles, signerPack, encoderQr, type PackSignable } from '../../paquets/noyau/src/index'
import { aujourdhui, code, commencer, DEMO, rangerBooster } from './aide'

test.describe.configure({ mode: 'parallel' })

const pack = (id: string, nom: string, rar: 'base' | 'rare' | 'legendaire' = 'base', x: Partial<PackSignable> = {}): PackSignable => ({
  format: 'memoire-des-luttes/pack', version: 1, id, nom,
  series: [{ id: 's-' + id, nom: 'Série ' + nom, cartes: [id + '-1', id + '-2'] }],
  cartes: [1, 2].map((n) => ({ id: `${id}-${n}`, fam: 'evenement', rar, title: `${nom} ${n}`, fait: 'Un fait sourcé.', src: 'Test' })),
  ...x,
})

async function installer(page: Page, texte: string) {
  await page.goto('/#plus')
  await page.locator('#import-texte').fill(texte)
  await page.getByRole('button', { name: 'Importer le texte' }).click()
}

test('pack officiel signé : installé, ses cartes arrivent dans l\'album ; modifié, il est refusé', async ({ page }) => {
  const app = await commencer(page)
  const signe = signerPack(pack('off', 'Front populaire'), DEMO.secrete)
  const falsifie = structuredClone(signe)
  falsifie.cartes[0].title = 'Front populaire bis'
  await installer(page, JSON.stringify(falsifie))
  await expect(page.getByText('modifié après sa signature')).toBeVisible()

  await installer(page, JSON.stringify(signe))
  await expect(page.getByText('Pack officiel « Front populaire » installé')).toBeVisible()
  await expect(page.locator('#packs').getByText('✊ Officiel')).toBeVisible()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Série Front populaire' })).toBeVisible()
  await expect(page.getByText('0/2')).toBeVisible()
  await app.verifierPropre()
})

test('pack local : en attente, puis accepté ; ses QR de stand ; ses droits ; la révocation', async ({ page }) => {
  const app = await commencer(page)
  const local = genererCles()
  const delegation = deleguer({ type: 'delegation', collectif: 'test-local', nom: 'Collectif test', clePublique: local.publique, droits: ['base'], emise: aujourdhui(), expire: '2099-12-31' }, DEMO.secrete)
  const qrStand = encoderQr({ t: 'S', i: 'stand-local', m: 'base', du: aujourdhui(), au: aujourdhui(), c: 'test-local' }, local.secrete)

  await installer(page, JSON.stringify(signerPack(pack('loc-trop', 'Trop rare', 'rare'), local.secrete, delegation)))
  await expect(page.getByText("n'a pas le droit de créer des cartes « rare »")).toBeVisible()

  await code(page, qrStand)
  await expect(page.getByText("ne connaît pas encore")).toBeVisible()

  await installer(page, JSON.stringify(signerPack(pack('loc', 'Douarnenez'), local.secrete, delegation)))
  await expect(page.getByText('Pack du collectif « Collectif test » reçu')).toBeVisible()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Série Douarnenez' })).toHaveCount(0)

  await page.goto('/#plus')
  await page.getByRole('button', { name: 'Faire confiance' }).click()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Série Douarnenez' })).toBeVisible()

  await code(page, qrStand)
  await expect(page.getByText('Stand · Collectif test')).toBeVisible()
  await rangerBooster(page)

  // Le collectif publie un pack officiel qui révoque la clé du collectif local.
  await installer(page, JSON.stringify(signerPack(pack('revoc', 'Révocations', 'base', { revocations: [local.publique] }), DEMO.secrete)))
  await expect(page.getByText('Pack officiel « Révocations » installé')).toBeVisible()
  await page.reload()
  await page.goto('/#plus')
  await expect(page.getByText('✗ Plus valide')).toBeVisible()
  await expect(page.getByText('a été révoquée')).toBeVisible()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Série Douarnenez' })).toHaveCount(0)
  await app.verifierPropre()
})

test('chercher de nouveaux packs sur le site', async ({ page }) => {
  const app = await commencer(page)
  const signe = signerPack(pack('site', 'Mai 68'), DEMO.secrete)
  // Le site simulé publie un index avec un pack signé, un brouillon non signé, et un pack introuvable.
  await page.route('**/packs/index.json', (r) => r.fulfill({ json: { format: 'memoire-des-luttes/index', version: 1, packs: [
    { id: 'site', nom: 'Mai 68', fichier: 'packs/site.json', confiance: 'officiel', signature: signe.signature!.valeur },
    { id: 'brouillon', nom: 'Brouillon', fichier: 'packs/brouillon.json', confiance: 'non-signe', signature: null },
  ] } }))
  await page.route('**/packs/site.json', (r) => r.fulfill({ body: JSON.stringify(signe), contentType: 'application/json' }))
  await page.goto('/#plus')
  await page.getByRole('button', { name: 'Chercher de nouveaux packs' }).click()
  await expect(page.getByText('Pack officiel « Mai 68 » installé')).toBeVisible()
  await page.getByRole('button', { name: 'Chercher de nouveaux packs' }).click()
  await expect(page.getByText('Tu as déjà tous les packs signés du site.')).toBeVisible()
  await page.goto('/#album')
  await expect(page.getByRole('heading', { name: 'Série Mai 68' })).toBeVisible()
  await app.verifierPropre()

  // Sans réseau (le navigateur signale alors une erreur de chargement, c'est normal).
  await page.unrouteAll()
  await page.route('**/packs/index.json', (r) => r.abort())
  await page.goto('/#plus')
  await page.getByRole('button', { name: 'Chercher de nouveaux packs' }).click()
  await expect(page.getByText('Impossible de joindre le site')).toBeVisible()
})
