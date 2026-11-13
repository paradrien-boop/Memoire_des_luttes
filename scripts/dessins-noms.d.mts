export const CADRES: Record<'personnage' | 'ennemis' | 'chat' | 'quartier', { x: number; y: number; l: number; h: number }>
export function nomsPossibles(): string[]
export const TAILLE_MAX: number
export function refusSvg(texte: string): string | null
export function nomDepuisFichier(chemin: string): string | null
