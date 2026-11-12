import type { CapacitorConfig } from '@capacitor/cli'

// L'application Android : la même app, emballée par Capacitor. Construite par npm run android (puis Gradle).
const config: CapacitorConfig = {
  appId: 'org.memoiredesluttes.app',
  appName: 'Mémoire des luttes',
  webDir: 'dist-android',
  android: {
    // Pas de contenu mélangé, pas de débogage à distance dans l'APK distribué.
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
}

export default config
