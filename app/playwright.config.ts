import { defineConfig } from '@playwright/test'

// Tests de bout en bout sur l'app construite (avec la clé de démonstration, MDL_DEMO=1).
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4174/', viewport: { width: 400, height: 860 }, trace: 'off', locale: 'fr-FR' },
  webServer: {
    command: 'npm run build:test && npx vite preview --outDir dist-test --port 4174 --strictPort',
    url: 'http://localhost:4174/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
