import { defineConfig } from '@playwright/test'

// Tests de bout en bout : l'app construite avec la clé de démonstration (MDL_DEMO=1), et la publication complète.
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4174/', viewport: { width: 400, height: 860 }, trace: 'off', locale: 'fr-FR' },
  webServer: [
    {
      // L'app construite avec la clé de démonstration (tests de l'app).
      command: 'npm run build:test && npx vite preview --outDir dist-test --port 4174 --strictPort',
      url: 'http://localhost:4174/',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // La publication complète, comme sur Codeberg Pages (tests du site et de l'app publiée).
      command: 'cd .. && npm run publier && cd app && npx vite preview --outDir ../publication --port 4176 --strictPort',
      url: 'http://localhost:4176/',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
})
