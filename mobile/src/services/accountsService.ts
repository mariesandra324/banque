import { USE_MOCKS } from "@/constants/config";
import { accounts, operations } from "@/constants/mockData";
import { Account, Operation, OperationDirection, OperationStatus, OperationType } from "@/constants/types";

import { apiRequest } from "./api";
import { MobileCompte, MobileDashboard, MobileTransaction, fetchDashboard } from "./dashboardService";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

function mapCompte(c: MobileCompte, holder: string): Account {
  const isEpargne = c.typeCompte?.toLowerCase().includes("epargne");
  return {
    id: String(c.id),
    numero: c.numeroCompte,
    label: isEpargne ? "Compte épargne" : "Compte courant",
    type: isEpargne ? "epargne" : "courant",
    iban: c.iban,
    balance: c.solde,
    currency: "MGA",
    holder,
    openedAt: c.dateCreation,
  };
}

function mapType(type: string): OperationType {
  switch (type?.toUpperCase()) {
    case "VIREMENT":
      return "virement";
    case "DEPOT":
      return "versement";
    case "RETRAIT":
      return "retrait";
    default:
      return "paiement";
  }
}

function mapStatus(statut: string): OperationStatus {
  switch (statut?.toUpperCase()) {
    case "SUCCES":
    case "REUSSI":
      return "effectue";
    case "EN_ATTENTE":
      return "en_attente";
    default:
      return "refuse";
  }
}

export function toOperation(
  t: MobileTransaction,
  myNumeros: Set<string>,
  myComptes: Map<string, string>
): Operation {
  const type = mapType(t.type);
  const upper = t.type?.toUpperCase();

  let accountNumero: string;
  let direction: OperationDirection;

  if (upper === "DEPOT") {
    accountNumero = t.numeroCompteSource;
    direction = "entrant";
  } else if (upper === "RETRAIT") {
    accountNumero = t.numeroCompteSource;
    direction = "sortant";
  } else {
    const destMine = myNumeros.has(t.numeroCompteDestination);
    accountNumero = destMine ? t.numeroCompteDestination : t.numeroCompteSource;
    direction = destMine ? "entrant" : "sortant";
  }

  const accountId = myComptes.get(accountNumero) ?? "";
  return {
    id: String(t.id),
    accountId,
    type,
    direction,
    label: t.description || t.type,
    amount: t.montant,
    currency: "MGA",
    date: t.dateTransaction,
    reference: t.reference,
    status: mapStatus(t.statut),
  };
}

function mapDashboardToAccounts(dash: MobileDashboard): Account[] {
  const holder = `${dash.prenom ?? ""} ${dash.nom ?? ""}`.trim() || "Client";
  return (dash.comptes ?? []).map((c) => mapCompte(c, holder));
}

function mapDashboardToOperations(dash: MobileDashboard): Operation[] {
  const myNumeros = new Set((dash.comptes ?? []).map((c) => c.numeroCompte));
  const myComptes = new Map((dash.comptes ?? []).map((c) => [c.numeroCompte, String(c.id)]));
  return (dash.dernieresOperations ?? []).map((t) => toOperation(t, myNumeros, myComptes));
}

export async function fetchAccounts(): Promise<Account[]> {
  if (USE_MOCKS) {
    await delay();
    return accounts;
  }
  // GET /api/mobile/dashboard -> comptes du client connecté
  const dash = await fetchDashboard();
  return mapDashboardToAccounts(dash);
}

export async function fetchAccountById(id: string): Promise<Account | undefined> {
  if (USE_MOCKS) {
    await delay(150);
    return accounts.find((a) => a.id === id);
  }
  const all = await fetchAccounts();
  return all.find((a) => a.id === id);
}

export async function fetchAccountOperations(accountId: string): Promise<Operation[]> {
  if (USE_MOCKS) {
    await delay(300);
    return operations
      .filter((o) => o.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  // GET /api/mobile/dashboard -> retrouve le numéro, puis /api/transactions/compte/:numero
  const dash = await fetchDashboard();
  const compte = dash.comptes.find((c) => String(c.id) === accountId);
  const numero = compte?.numeroCompte;
  if (!numero) return [];

  const tx = await apiRequest<MobileTransaction[]>(`/transactions/compte/${numero}`);
  const myNumeros = new Set(dash.comptes.map((c) => c.numeroCompte));
  const myComptes = new Map(dash.comptes.map((c) => [c.numeroCompte, String(c.id)]));
  return tx.map((t) => toOperation(t, myNumeros, myComptes));
}

export async function fetchAllOperations(): Promise<Operation[]> {
  if (USE_MOCKS) {
    await delay(300);
    return [...operations].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  // GET /api/mobile/dashboard -> dernières opérations du client
  const dash = await fetchDashboard();
  return mapDashboardToOperations(dash);
}

export async function verifyPin(compteId: number, pin: string): Promise<boolean> {
  // POST /api/cartes/verifier-pin -> vérifie le PIN de la carte du compte
  // PIN incorrect -> HTTP 400 { message: "PIN incorrect." } -> throw
  const response = await apiRequest<{ valide: boolean; message?: string }>("/cartes/verifier-pin", {
    method: "POST",
    body: JSON.stringify({ compteId, pin }),
  });
  if (!response.valide) {
    throw new Error(response.message || "PIN incorrect.");
  }
  return true;
}