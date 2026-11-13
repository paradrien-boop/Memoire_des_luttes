export const CADRES: Record<'personnage' | 'ennemis' | 'chat' | 'quartier', { x: number; y: number; l: number; h: number }>
export function nomsPossibles(): string[]
export const TAILLE_MAX: number
export function lireDessins(racine: string): { dessins: Record<string, { type: 'svg' | 'png'; contenu: string }>; problemes: string[] }
