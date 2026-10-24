export type AccountType = "courant" | "epargne";

export interface Account {
  id: string;
  numero: string;
  label: string;
  type: AccountType;
  iban: string;
  balance: number;
  currency: string;
  holder: string;
  openedAt: string;
}

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  numeroCompte: string;
  numeroCarte: string;
  dateExpiration?: string;
  typeCompte: string;
  solde?: number;
  email?: string;
  telephone?: string;
  adresse?: string;
  cin?: string;
  dateNaissance?: string;
  photoUri?: string | null;
}

export type OperationType = "virement" | "versement" | "paiement" | "retrait";
export type OperationDirection = "entrant" | "sortant";
export type OperationStatus = "effectue" | "en_attente" | "refuse";

export interface Operation {
  id: string;
  accountId: string;
  type: OperationType;
  direction: OperationDirection;
  label: string;
  amount: number;
  currency: string;
  date: string;
  reference: string;
  status: OperationStatus;
}

export type TransferStatus = "effectue" | "en_attente" | "en_cours" | "refuse";

export interface Beneficiary {
  id: string;
  nom: string;
  iban: string;
}

export interface Transfer {
  id: string;
  reference: string;
  montant: number;
  devise: string;
  expediteur: string;
  destinataire: string;
  ibanDestinataire: string;
  motif: string;
  date: string;
  statut: TransferStatus;
}

export type DepositType = "especes" | "cheque" | "guichet";
export type DepositStatus = "en_attente" | "valide" | "refuse";

export interface DepositRequest {
  id: string;
  type: DepositType;
  montant: number;
  devise: string;
  compte: string;
  date: string;
  statut: DepositStatus;
  agence?: string;
}

export interface CreditOffer {
  id: string;
  titre: string;
  description: string;
  montantMax: number;
  tauxAnnuel: number;
  dureeMaxMois: number;
  mensualite: number;
  devise: string;
  statut?: string;
  numeroOffre?: string;
  dateExpiration?: string;
}

export type CreditStatus = "en_attente" | "en_cours" | "accepte" | "refuse" | "rembourse";

export interface CreditRequest {
  id: string;
  montant: number;
  devise: string;
  dureeMois: number;
  motif: string;
  statut: CreditStatus;
  date: string;
}

export interface Echeance {
  id?: number;
  numero: number;
  date: string;
  capital: number;
  interets: number;
  total: number;
  restantApres: number;
  payee: boolean;
}

export interface Loan {
  id: string;
  reference: string;
  montant: number;
  devise: string;
  tauxAnnuel: number;
  dureeMois: number;
  mensualite: number;
  resteDu: number;
  statut: CreditStatus;
  debutAt: string;
  prochaineEcheance?: string;
  echeances: Echeance[];
}

export interface AppNotification {
  id: string;
  type: string;
  titre: string;
  message: string;
  lien?: string | null;
  date: string;
  lue: boolean;
  emoji?: string | null;
}

export interface Settings {
  notificationsPush: boolean;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  langue: "fr" | "mg";
  theme: "auto" | "clair" | "sombre";
}