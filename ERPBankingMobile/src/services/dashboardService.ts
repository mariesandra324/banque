import { USE_MOCKS } from "@/constants/config";
import { accounts, operations, currentUser } from "@/constants/mockData";

import { apiRequest } from "./api";

export interface MobileCompte {
  id: number;
  numeroCompte: string;
  typeCompte: string;
  solde: number;
  statut: string;
  dateCreation: string;
  clientId: number;
  iban: string;
}

export interface MobileTransaction {
  id: number;
  reference: string;
  type: string;
  montant: number;
  dateTransaction: string;
  description: string;
  statut: string;
  numeroCompteSource: string;
  numeroCompteDestination: string;
}

export interface MobileDashboard {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  comptes: MobileCompte[];
  soldeTotal: number;
  dernieresOperations: MobileTransaction[];
}

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export async function fetchDashboard(): Promise<MobileDashboard> {
  if (USE_MOCKS) {
    await delay();
    return {
      id: 1,
      nom: currentUser.nom,
      prenom: currentUser.prenom,
      email: currentUser.email ?? "",
      telephone: currentUser.telephone ?? "",
      comptes: accounts.map((a) => ({
        id: Number(a.id.replace("a", "")),
        numeroCompte: a.numero,
        typeCompte: a.type,
        solde: a.balance,
        statut: "ACTIF",
        dateCreation: a.openedAt,
        clientId: 1,
        iban: a.iban,
      })),
      soldeTotal: accounts.reduce((sum, a) => sum + a.balance, 0),
      dernieresOperations: operations.slice(0, 5).map((o) => ({
        id: Number(o.id.replace("op", "")),
        reference: o.reference,
        type: o.type,
        montant: o.amount,
        dateTransaction: o.date,
        description: o.label,
        statut: o.status,
        numeroCompteSource: o.direction === "sortant" ? aNumero(o.accountId) : "",
        numeroCompteDestination: o.direction === "entrant" ? aNumero(o.accountId) : "",
      })),
    };
  }
  // GET /api/mobile/dashboard
  return apiRequest<MobileDashboard>("/mobile/dashboard");
}

function aNumero(accountId: string): string {
  return accounts.find((a) => a.id === accountId)?.numero ?? "";
}