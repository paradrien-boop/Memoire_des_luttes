// Carte des idées : disposition des cartes et de leurs liens (algorithme de forces simple, reproductible).
import { hasardDepuis } from "./quiz";

export interface Noeud { id: string; x: number; y: number }
export interface Lien { a: string; b: string }

/** Les liens entre cartes, sans doublon (un lien A→B et B→A n'en font qu'un). */
export function liensUniques(cartes: { id: string; links?: string[] }[]): Lien[] {
  const vus = new Set<string>();
  const liens: Lien[] = [];
  for (const c of cartes) for (const l of c.links ?? []) {
    const cle = [c.id, l].sort().join("|");
    if (c.id === l || vus.has(cle)) continue;
    vus.add(cle);
    liens.push({ a: c.id, b: l });
  }
  return liens;
}

/**
 * Place les nœuds dans un rectangle : les cartes liées se rapprochent, les autres se repoussent.
 * Toujours la même disposition pour les mêmes cartes (hasard à graine).
 */
export function disposer(ids: string[], liens: Lien[], largeur: number, hauteur: number, marge = 30, tours = 300, ecart = 0.75): Noeud[] {
  const hasard = hasardDepuis(ids.join(","));
  const n = ids.length;
  const p = new Map(ids.map((id, i) => {
    const angle = (i / Math.max(1, n)) * Math.PI * 2;
    return [id, { x: largeur / 2 + Math.cos(angle) * largeur / 3 + hasard() * 10, y: hauteur / 2 + Math.sin(angle) * hauteur / 3 + hasard() * 10 }];
  }));
  const utiles = liens.filter((l) => p.has(l.a) && p.has(l.b));
  const k = Math.sqrt((largeur * hauteur) / Math.max(1, n)) * ecart;
  for (let t = 0; t < tours; t++) {
    const temperature = (largeur / 10) * (1 - t / tours) + 0.5;
    const d = new Map(ids.map((id) => [id, { x: 0, y: 0 }]));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = p.get(ids[i])!, b = p.get(ids[j])!;
      let dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.max(0.01, Math.hypot(dx, dy));
      const f = (k * k) / dist;
      dx /= dist; dy /= dist;
      d.get(ids[i])!.x += dx * f; d.get(ids[i])!.y += dy * f;
      d.get(ids[j])!.x -= dx * f; d.get(ids[j])!.y -= dy * f;
    }
    for (const l of utiles) {
      const a = p.get(l.a)!, b = p.get(l.b)!;
      let dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.max(0.01, Math.hypot(dx, dy));
      const f = (dist * dist) / k;
      dx /= dist; dy /= dist;
      d.get(l.a)!.x -= dx * f; d.get(l.a)!.y -= dy * f;
      d.get(l.b)!.x += dx * f; d.get(l.b)!.y += dy * f;
    }
    for (const id of ids) {
      const q = p.get(id)!, v = d.get(id)!;
      // légère attraction vers le centre, pour que les cartes isolées ne partent pas dans les coins
      v.x += (largeur / 2 - q.x) * 0.05; v.y += (hauteur / 2 - q.y) * 0.05;
      const len = Math.max(0.01, Math.hypot(v.x, v.y));
      q.x = Math.min(largeur - marge, Math.max(marge, q.x + (v.x / len) * Math.min(len, temperature)));
      q.y = Math.min(hauteur - marge, Math.max(marge, q.y + (v.y / len) * Math.min(len, temperature)));
    }
  }
  return ids.map((id) => ({ id, ...p.get(id)! }));
}

/**
 * Écarte les nœuds pour que leurs étiquettes (des boîtes de « boite.l × boite.h » centrées sous chaque nœud)
 * ne se chevauchent pas, en restant dans le cadre. On pousse sur l'axe où le chevauchement est le plus petit.
 */
export function ecarterEtiquettes(noeuds: Noeud[], boite: { l: number; h: number }, largeur: number, hauteur: number, marge: { x: number; y: number }, tours = 400): Noeud[] {
  const p = noeuds.map((n) => ({ ...n }));
  const borner = (q: Noeud) => {
    q.x = Math.min(largeur - marge.x, Math.max(marge.x, q.x));
    q.y = Math.min(hauteur - marge.y, Math.max(marge.y, q.y));
  };
  for (let t = 0; t < tours; t++) {
    let bouge = false;
    for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
      const a = p[i], b = p[j];
      const ox = boite.l - Math.abs(a.x - b.x), oy = boite.h - Math.abs(a.y - b.y);
      if (ox <= 0 || oy <= 0) continue;
      bouge = true;
      if (oy <= ox) {
        const s = (a.y <= b.y ? -1 : 1) * (oy / 2 + 0.5);
        a.y += s; b.y -= s;
      } else {
        const s = (a.x <= b.x ? -1 : 1) * (ox / 2 + 0.5);
        a.x += s; b.x -= s;
      }
      borner(a); borner(b);
    }
    if (!bouge) break;
  }
  return p;
}
