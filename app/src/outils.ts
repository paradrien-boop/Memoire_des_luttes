const MOTS_VIDES = new Set(['le', 'la', 'les', 'de', 'des', 'du', 'l', 'd', 'aux', 'au', 'et', 'en', 'pour', 'plus', 'a'])

/** Les initiales affichées en grand quand une carte n'a pas d'image. */
export function initiales(titre: string): string {
  const mots = String(titre || '?').split(/[\s'’-]+/).filter((m) => m && !MOTS_VIDES.has(m.toLowerCase()))
  return (mots.slice(0, 2).map((m) => m[0]).join('') || '?').toUpperCase()
}

/** Date du jour au format AAAA-MM-JJ, à l'heure du téléphone. */
export function dateDuJour(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function duree(ms: number): string {
  const s = Math.floor(ms / 1000)
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, '0')).join(':')
}

/** Réduit une image (côté le plus long 480 px) et la passe en JPEG, pour la stocker dans la carte. */
export function reduireImage(fichier: File): Promise<string> {
  return new Promise((resoudre, rejeter) => {
    const lecteur = new FileReader()
    lecteur.onerror = () => rejeter(new Error("Impossible de lire l'image."))
    lecteur.onload = () => {
      const img = new Image()
      img.onerror = () => rejeter(new Error("Ce fichier n'est pas une image lisible."))
      img.onload = () => {
        const k = Math.min(1, 480 / Math.max(img.width, img.height))
        const toile = document.createElement('canvas')
        toile.width = Math.round(img.width * k)
        toile.height = Math.round(img.height * k)
        toile.getContext('2d')!.drawImage(img, 0, 0, toile.width, toile.height)
        resoudre(toile.toDataURL('image/jpeg', 0.7))
      }
      img.src = lecteur.result as string
    }
    lecteur.readAsDataURL(fichier)
  })
}
