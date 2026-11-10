declare module 'virtual:mdl-site' {
  export interface CarteSite { id: string; title: string; fam: string; rar: string; statut: string; serie: string; pack: string }
  export interface PackSite { id: string; nom: string; fichier: string; cartes: number; confiance: 'officiel' | 'local' | 'non-signe' | 'invalide'; signataire: string | null }
  export interface CollectifSite { id: string; nom: string; presentation: string; themes: string[]; valide: boolean; raison?: string; expire?: string; empreinte?: string }
  const site: {
    familles: Record<string, string>
    cartes: CarteSite[]
    packs: PackSite[]
    evenements: number
    collectifs: CollectifSite[]
    cles: { nom: string; empreintes: string[]; revocations: number }
    config: { lienDebat: string; texteDebat: string }
  }
  export default site
}
