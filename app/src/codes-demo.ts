// Codes de stand de démonstration. Dans la vraie version (étape 4), ce seront des QR signés.
import type { Rarete } from '@mdl/noyau'

export type CodeStand =
  | { libelle: string; minimum: Rarete }
  | { libelle: string; evenement: string }

export const CODES_DEMO: Record<string, CodeStand> = {
  'COMMUNE-71': { libelle: 'Stand « Vive la Commune »', minimum: 'legendaire' },
  'MUR-28-MAI': { libelle: 'Tract du Mur des Fédérés', minimum: 'rare' },
  '18-MARS-2027': { libelle: "Carte d'événement", evenement: 'ev-18mars2027' },
}
