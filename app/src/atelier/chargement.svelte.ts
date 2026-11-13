// Lecture des fichiers de l'illustratrice ou de l'illustrateur, dans le navigateur : rien n'est envoyé.
// Mêmes règles que npm run valider (scripts/dessins-noms.mjs) : noms, formats, taille, sécurité.
import { nomDepuisFichier, refusSvg, TAILLE_MAX } from '../../../scripts/dessins-noms.mjs'
import { essais, type FichierDessin } from '../dessins/fichiers.svelte'

export type Ligne = { fichier: string; nom: string | null; probleme: string | null; quand: number }

export const journal = $state<{ lignes: Ligne[] }>({ lignes: [] })

function noter(l: Ligne) {
  journal.lignes = [l, ...journal.lignes.filter((x) => x.fichier !== l.fichier)]
}

function base64(tampon: ArrayBuffer): string {
  const octets = new Uint8Array(tampon)
  let s = ''
  for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode(...octets.subarray(i, i + 0x8000))
  return btoa(s)
}

/** Ajoute un fichier aux essais ; renvoie le nom du dessin reconnu, ou null s'il est refusé. */
export async function lireFichier(fichier: File, chemin = fichier.webkitRelativePath || fichier.name): Promise<string | null> {
  const quand = Date.now()
  if (!/\.(svg|png)$/i.test(chemin)) {
    if (!/(^|\/)\.|\.md$/i.test(chemin)) noter({ fichier: chemin, nom: null, probleme: 'seuls les fichiers SVG et PNG sont lus', quand })
    return null
  }
  if (/(^|\/)(gabarits|modeles)\//.test(chemin)) return null // les gabarits et modèles ne sont pas des dessins
  const nom = nomDepuisFichier(chemin)
  if (!nom) {
    noter({ fichier: chemin, nom: null, probleme: "nom non reconnu : renomme le fichier comme dans la liste des dessins attendus", quand })
    return null
  }
  if (fichier.size > TAILLE_MAX) {
    noter({ fichier: chemin, nom, probleme: `trop lourd (${Math.round(fichier.size / 1024)} Ko, maximum ${TAILLE_MAX / 1024} Ko)`, quand })
    return null
  }
  let f: FichierDessin
  if (/\.png$/i.test(chemin)) f = { type: 'png', contenu: base64(await fichier.arrayBuffer()) }
  else {
    const texte = await fichier.text()
    const refus = refusSvg(texte)
    if (refus) {
      noter({ fichier: chemin, nom, probleme: refus, quand })
      return null
    }
    f = { type: 'svg', contenu: texte }
  }
  essais.fichiers = { ...essais.fichiers, [nom]: f }
  noter({ fichier: chemin, nom, probleme: null, quand })
  return nom
}

export async function lireFichiers(fichiers: Iterable<File>) {
  for (const f of [...fichiers]) await lireFichier(f)
}

/** Fichiers et dossiers glissés dans la page (les dossiers sont parcourus). */
export async function lireDepot(dt: DataTransfer) {
  const entrees = [...dt.items].map((i) => i.webkitGetAsEntry?.()).filter((e): e is FileSystemEntry => !!e)
  if (!entrees.length) return lireFichiers(dt.files)
  const parcourir = async (e: FileSystemEntry, chemin: string): Promise<void> => {
    if (e.isFile) {
      const f = await new Promise<File>((ok, ko) => (e as FileSystemFileEntry).file(ok, ko))
      await lireFichier(f, chemin + e.name)
    } else if (e.isDirectory) {
      const lecteur = (e as FileSystemDirectoryEntry).createReader()
      let lot: FileSystemEntry[]
      do {
        lot = await new Promise<FileSystemEntry[]>((ok, ko) => lecteur.readEntries(ok, ko))
        for (const x of lot) await parcourir(x, chemin + e.name + '/')
      } while (lot.length)
    }
  }
  for (const e of entrees) await parcourir(e, '')
}

export function toutRetirer() {
  essais.fichiers = {}
  journal.lignes = []
}

// ——— Dossier de travail suivi (Chrome, Edge) : la page relit les fichiers modifiés toutes les secondes. ———

type Poignee = { kind: 'file' | 'directory'; name: string; getFile?: () => Promise<File>; values?: () => AsyncIterable<Poignee> }
const vus = new Map<string, number>()
let minuterie: ReturnType<typeof setInterval> | null = null
export const suivi = $state<{ dossier: string | null }>({ dossier: null })
export const suiviPossible = typeof window !== 'undefined' && 'showDirectoryPicker' in window

async function parcourirDossier(d: Poignee, chemin: string) {
  for await (const e of d.values!()) {
    if (e.name.startsWith('.')) continue
    if (e.kind === 'directory') await parcourirDossier(e, chemin + e.name + '/')
    else {
      const f = await e.getFile!()
      const cle = chemin + e.name
      if (vus.get(cle) === f.lastModified) continue
      vus.set(cle, f.lastModified)
      await lireFichier(f, cle)
    }
  }
}

export async function suivreDossier() {
  const choisir = (window as unknown as { showDirectoryPicker: (o?: object) => Promise<Poignee> }).showDirectoryPicker
  let dossier: Poignee
  try {
    dossier = await choisir({ mode: 'read' })
  } catch {
    return // fenêtre fermée sans choisir
  }
  arreterSuivi()
  suivi.dossier = dossier.name
  await parcourirDossier(dossier, dossier.name + '/')
  let occupe = false
  minuterie = setInterval(async () => {
    if (occupe) return
    occupe = true
    try {
      await parcourirDossier(dossier, dossier.name + '/')
    } catch {
      arreterSuivi()
    } finally {
      occupe = false
    }
  }, 1000)
}

export function arreterSuivi() {
  if (minuterie) clearInterval(minuterie)
  minuterie = null
  vus.clear()
  suivi.dossier = null
}
