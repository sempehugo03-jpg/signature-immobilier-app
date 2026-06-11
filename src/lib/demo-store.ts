import { agencyConfig } from "@/lib/agency-config";

// Tiny localStorage-backed store for the demo (works only on client).
export type Diagnostic = {
  id: string;
  createdAt: string;
  bien: {
    type: string;
    ville: string;
    codePostal: string;
    adresse: string;
    surface: string;
    terrain: string;
    pieces: string;
    chambres: string;
    exterieur: string;
    stationnement: string;
  };
  etat: {
    general: string;
    travaux: string;
    diagnostics: string;
    dpe: string;
    forts: string;
    faibles: string;
  };
  projet: {
    delai: string;
    raison: string;
    estimation: string;
    dejaEnVente: string;
    priorite: string;
  };
  contact: {
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
    moment: string;
    consent: boolean;
  };
  photos: {
    count: string;
    notes: string;
  };
  score: number;
  temperature: "froid" | "tiede" | "chaud" | "tres-chaud";
};

const KEY = "signature_diag_current";
const KEY_LIST = "signature_diag_list";

export function saveDiagnostic(d: Diagnostic) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(d));
  const list = listDiagnostics().filter((x) => x.id !== d.id);
  list.unshift(d);
  localStorage.setItem(KEY_LIST, JSON.stringify(list));
}

export function getCurrentDiagnostic(): Diagnostic | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function listDiagnostics(): Diagnostic[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY_LIST);
  return raw ? JSON.parse(raw) : [];
}

export function computeScore(
  d: Omit<Diagnostic, "id" | "createdAt" | "score" | "temperature">,
): {
  score: number;
  temperature: Diagnostic["temperature"];
} {
  let s = 50;
  if (d.etat.general === "excellent") s += 15;
  else if (d.etat.general === "bon") s += 8;
  else if (d.etat.general === "travaux") s -= 10;
  if (d.etat.diagnostics === "oui") s += 8;
  if (["A", "B", "C"].includes(d.etat.dpe)) s += 6;
  if (["F", "G"].includes(d.etat.dpe)) s -= 8;
  if (d.projet.delai === "urgent") s += 5;
  if (d.projet.dejaEnVente === "oui") s -= 5;
  if (parseInt(d.bien.surface || "0") > 80) s += 5;
  s = Math.max(20, Math.min(95, s));

  let temperature: Diagnostic["temperature"] = "tiede";
  if (d.projet.delai === "urgent") temperature = "tres-chaud";
  else if (d.projet.delai === "1-3") temperature = "chaud";
  else if (d.projet.delai === "3-6") temperature = "tiede";
  else temperature = "froid";

  return { score: s, temperature };
}

export const fakeProspects = agencyConfig.prospects;
export const fakeVisits = agencyConfig.visits;
