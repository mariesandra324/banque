import {
  Account,
  AppNotification,
  CreditOffer,
  CreditRequest,
  DepositRequest,
  Loan,
  Operation,
  Transfer,
  User,
} from "./types";

export const currentUser: User = {
  nom: "Rakoto",
  prenom: "Jean",
  numeroCompte: "MG46 0001 2345 6789 0123",
  numeroCarte: "4539 1234 5678 9012",
  dateExpiration: "09/28",
  typeCompte: "courant",
  email: "jean.rakoto@example.com",
  telephone: "+261 34 12 345 67",
  adresse: "Lot II A 123 Ambohimanarina, Antananarivo",
  cin: "101 234 567 891",
  dateNaissance: "1990-05-14",
};

export const accounts: Account[] = [
  {
    id: "a1",
    numero: "0001 234567 8901",
    label: "Compte courant",
    type: "courant",
    iban: "MG46 0001 2345 6789 0123",
    balance: 1_284_500,
    currency: "MGA",
    holder: "Jean RAKOTO",
    openedAt: "2019-03-15",
  },
  {
    id: "a2",
    numero: "0001 234567 8902",
    label: "Compte épargne",
    type: "epargne",
    iban: "MG46 0001 2345 6789 0456",
    balance: 4_760_000,
    currency: "MGA",
    holder: "Jean RAKOTO",
    openedAt: "2021-07-02",
  },
];

export const operations: Operation[] = [
  {
    id: "op1",
    accountId: "a1",
    type: "virement",
    direction: "sortant",
    label: "Virement Loyer",
    amount: 350_000,
    currency: "MGA",
    date: "2026-09-10T09:15:00",
    reference: "VIR-20260910-001",
    status: "effectue",
  },
  {
    id: "op2",
    accountId: "a1",
    type: "versement",
    direction: "entrant",
    label: "Versement Salaire",
    amount: 1_800_000,
    currency: "MGA",
    date: "2026-09-08T08:00:00",
    reference: "VER-20260908-002",
    status: "effectue",
  },
  {
    id: "op3",
    accountId: "a2",
    type: "versement",
    direction: "entrant",
    label: "Épargne mensuelle",
    amount: 200_000,
    currency: "MGA",
    date: "2026-09-05T10:30:00",
    reference: "VER-20260905-003",
    status: "effectue",
  },
  {
    id: "op4",
    accountId: "a1",
    type: "paiement",
    direction: "sortant",
    label: "Règlement JIRAMA",
    amount: 85_000,
    currency: "MGA",
    date: "2026-09-03T16:45:00",
    reference: "PAY-20260903-004",
    status: "effectue",
  },
  {
    id: "op5",
    accountId: "a1",
    type: "virement",
    direction: "entrant",
    label: "Virement reçu M. RABE",
    amount: 120_000,
    currency: "MGA",
    date: "2026-08-28T11:20:00",
    reference: "VIR-20260828-005",
    status: "effectue",
  },
  {
    id: "op6",
    accountId: "a2",
    type: "retrait",
    direction: "sortant",
    label: "GAB — Retrait",
    amount: 100_000,
    currency: "MGA",
    date: "2026-08-20T14:10:00",
    reference: "GAB-20260820-006",
    status: "effectue",
  },
];

export const transfers: Transfer[] = [
  {
    id: "t1",
    reference: "VIR-20260910-001",
    montant: 350_000,
    devise: "MGA",
    expediteur: "Compte courant",
    destinataire: "Agence Immobilière HAVATSA",
    ibanDestinataire: "MG46 0001 9876 5432 1000",
    motif: "Loyer septembre",
    date: "2026-09-10T09:15:00",
    statut: "effectue",
  },
  {
    id: "t2",
    reference: "VIR-20260828-005",
    montant: 120_000,
    devise: "MGA",
    expediteur: "M. RABE",
    destinataire: "Jean RAKOTO",
    ibanDestinataire: "MG46 0001 2345 6789 0123",
    motif: "Remboursement prêt",
    date: "2026-08-28T11:20:00",
    statut: "effectue",
  },
  {
    id: "t3",
    reference: "VIR-20260912-009",
    montant: 75_000,
    devise: "MGA",
    expediteur: "Compte courant",
    destinataire: "UNIVERSITÉ Madagascar",
    ibanDestinataire: "MG46 0001 5555 7777 8888",
    motif: "Frais de scolarité",
    date: "2026-09-12T08:05:00",
    statut: "en_attente",
  },
];

export const deposits: DepositRequest[] = [
  {
    id: "d1",
    type: "especes",
    montant: 500_000,
    devise: "MGA",
    compte: "Compte courant",
    date: "2026-09-02T10:00:00",
    statut: "valide",
    agence: "Agence Analakely",
  },
  {
    id: "d2",
    type: "cheque",
    montant: 250_000,
    devise: "MGA",
    compte: "Compte courant",
    date: "2026-09-11T15:30:00",
    statut: "en_attente",
    agence: "Agence Ankorondrano",
  },
];

export const creditOffers: CreditOffer[] = [
  {
    id: "c1",
    titre: "Crédit Loisirs",
    description:
      "Financez vos loisirs, voyages et projets personnels. Offre réservée aux clients réguliers, déblocage rapide sous 48h.",
    montantMax: 10_000_000,
    tauxAnnuel: 12.5,
    dureeMaxMois: 36,
    mensualite: 334_000,
    devise: "MGA",
  },
  {
    id: "c2",
    titre: "Crédit Auto",
    description:
      "Achetez votre véhicule neuf ou d'occasion avec un financement jusqu'à 80% du prix. Durée flexible jusqu'à 60 mois.",
    montantMax: 50_000_000,
    tauxAnnuel: 10.0,
    dureeMaxMois: 60,
    mensualite: 1_063_000,
    devise: "MGA",
  },
  {
    id: "c3",
    titre: "Crédit Immobilier",
    description:
      "Construisez ou achetez votre logement. Taux préférentiel et durée longue pour un confort de remboursement.",
    montantMax: 200_000_000,
    tauxAnnuel: 8.5,
    dureeMaxMois: 240,
    mensualite: 1_737_000,
    devise: "MGA",
  },
];

export const creditRequests: CreditRequest[] = [
  {
    id: "cr1",
    montant: 12_000_000,
    devise: "MGA",
    dureeMois: 36,
    motif: "Renovation de la maison",
    statut: "en_attente",
    date: "2026-08-25T09:00:00",
  },
  {
    id: "cr2",
    montant: 3_500_000,
    devise: "MGA",
    dureeMois: 12,
    motif: "Achat ordinateur + matériel",
    statut: "refuse",
    date: "2026-07-14T14:00:00",
  },
];

function buildEcheances(
  loanId: string,
  montant: number,
  taux: number,
  duree: number,
  mensualite: number,
  debut: string
): Loan {
  const monthlyRate = taux / 100 / 12;
  let restant = montant;
  let date = new Date(debut);
  const echeances: Loan["echeances"] = [];
  for (let i = 1; i <= duree; i++) {
    const interets = restant * monthlyRate;
    const capital = mensualite - interets;
    restant = Math.max(0, restant - capital);
    date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    echeances.push({
      numero: i,
      date: date.toISOString().slice(0, 10),
      capital: Math.round(capital),
      interets: Math.round(interets),
      total: Math.round(mensualite),
      restantApres: Math.round(restant),
      payee: i <= 3,
    });
  }
  return {
    id: loanId,
    reference: loanId.toUpperCase(),
    montant,
    devise: "MGA",
    tauxAnnuel: taux,
    dureeMois: duree,
    mensualite,
    resteDu: echeances.filter((e) => !e.payee).reduce((sum, e) => sum + e.total, 0),
    statut: "en_cours",
    debutAt: debut,
    prochaineEcheance: echeances.find((e) => !e.payee)?.date,
    echeances,
  };
}

export const loans: Loan[] = [
  buildEcheances("loans-0001", 15_000_000, 12.5, 36, 501_500, "2026-01-01"),
  buildEcheances("loans-0002", 6_000_000, 10, 24, 276_900, "2026-03-01"),
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "virement",
    titre: "Virement émis",
    message: "Votre virement de 350 000 MGA vers Agence Immobilière HAVATSA a été effectué.",
    date: "2026-09-10T09:16:00",
    lue: false,
  },
  {
    id: "n2",
    type: "credit",
    titre: "Nouvelle offre de crédit",
    message: "Une nouvelle offre « Crédit Auto » jusqu'à 50 000 000 MGA est disponible.",
    date: "2026-09-09T08:00:00",
    lue: false,
  },
  {
    id: "n3",
    type: "paiement",
    titre: "Paiement reçu",
    message: "Vous avez reçu un virement de 120 000 MGA depuis M. RABE.",
    date: "2026-08-28T11:21:00",
    lue: true,
  },
  {
    id: "n4",
    type: "securite",
    titre: "Connexion à votre espace",
    message: "Une connexion a été détectée sur votre application mobile.",
    date: "2026-08-20T07:45:00",
    lue: true,
  },
  {
    id: "n5",
    type: "info",
    titre: "Nouvelle version",
    message: "La version 1.0 de l'application est disponible.",
    date: "2026-08-01T10:00:00",
    lue: true,
  },
];

export const mockSettings = {
  notificationsPush: true,
  notificationsEmail: true,
  notificationsSms: false,
  langue: "fr" as const,
  theme: "auto" as const,
};