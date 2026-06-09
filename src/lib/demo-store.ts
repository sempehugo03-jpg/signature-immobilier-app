// Tiny localStorage-backed store for the demo (works only on client).
export type Diagnostic = {
  id: string;
  createdAt: string;
  bien: {
    type: string;
    ville: string;
    adresse: string;
    surface: string;
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

export function computeScore(d: Omit<Diagnostic, "id" | "createdAt" | "score" | "temperature">): {
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

// Fictional prospects for the agency dashboard
export const fakeProspects = [
  {
    id: "p1",
    prenom: "Julien",
    nom: "Marot",
    ville: "Tarbes",
    bien: "Maison 115 m²",
    surface: 115,
    type: "Maison",
    pieces: 5,
    delai: "1 à 3 mois",
    motivation: "Mutation professionnelle",
    score: "chaud" as const,
    action: "Rappeler aujourd'hui",
    peur: "Vendre trop vite à un prix bas",
    forts: ["Jardin clos", "Quartier recherché", "Lumineuse"],
    faibles: ["Cuisine à rafraîchir", "DPE D"],
    docs: ["Titre de propriété", "Taxe foncière", "DPE"],
    angle: "Sécuriser le prix de départ pour ne pas perdre 2 mois",
    script:
      "Bonjour Julien, j'ai bien reçu votre diagnostic vendeur. Ce qui ressort, c'est que votre projet semble assez avancé, notamment avec votre délai de 1 à 3 mois. Le point important maintenant, c'est de sécuriser le prix de départ pour éviter de perdre du temps ou de devoir baisser plus tard. Je vous propose qu'on regarde ensemble la stratégie la plus intelligente pour vendre dans les meilleures conditions.",
  },
  {
    id: "p2",
    prenom: "Claire",
    nom: "Lemoine",
    ville: "Bagnères-de-Bigorre",
    bien: "Appartement 67 m²",
    surface: 67,
    type: "Appartement",
    pieces: 3,
    delai: "Pas pressée",
    motivation: "Achat d'un autre bien",
    score: "tiede" as const,
    action: "Envoyer une première analyse",
    peur: "Choisir la mauvaise agence",
    forts: ["Centre-ville", "Balcon", "Faibles charges"],
    faibles: ["3e étage sans ascenseur"],
    docs: ["Charges de copropriété", "Règlement de copropriété"],
    angle: "Lui montrer la valeur d'un accompagnement long",
    script:
      "Bonjour Claire, suite à votre diagnostic, je vous envoie aujourd'hui une première analyse de votre appartement avec une fourchette de prix réaliste et la concurrence locale. L'idée n'est pas de vous presser, mais de vous donner une vision claire pour décider sereinement le moment venu.",
  },
  {
    id: "p3",
    prenom: "Marc",
    nom: "Berthier",
    ville: "Lourdes",
    bien: "Maison 140 m²",
    surface: 140,
    type: "Maison",
    pieces: 6,
    delai: "Urgent",
    motivation: "Séparation",
    score: "tres-chaud" as const,
    action: "Appeler sous 2 heures",
    peur: "Que la situation s'éternise",
    forts: ["Grand terrain", "Garage double", "Travaux récents"],
    faibles: ["Décoration personnelle marquée"],
    docs: ["Titre de propriété", "Factures de travaux"],
    angle: "Prendre en main rapidement et discrètement",
    script:
      "Bonjour Marc, je vous appelle suite à votre diagnostic. Je comprends que le contexte demande d'aller vite et avec discrétion. Mon rôle est de vous proposer une stratégie de vente claire, un calendrier serré et un seul interlocuteur du début à la fin. Je vous propose qu'on se voie rapidement, idéalement cette semaine.",
  },
];

export const fakeVisits = [
  {
    id: "v1",
    bien: "Maison 115 m² — Tarbes",
    acheteur: "Famille Dubois",
    date: "12 mars 2026",
    interet: "fort" as const,
    apprecies: "Emplacement, luminosité, jardin",
    blocages: "Travaux cuisine à prévoir",
    financement: "en cours" as const,
    prochaine: "Relance sous 48h",
    resume:
      "Les visiteurs ont apprécié l'emplacement, la luminosité et le jardin. Leur principale hésitation concerne les travaux de cuisine. Leur financement est en cours de validation. Une relance est prévue sous 48 heures.",
  },
];
