import { defineConfig } from 'vitest/config'

// Tests unitaires du noyau. Les tests de bout en bout de l'app (app/tests) passent par Playwright.
export default defineConfig({ test: { include: ['paquets/**/*.test.ts', 'scripts/**/*.test.ts'] } })
