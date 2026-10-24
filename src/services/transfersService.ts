import { USE_MOCK_FOR_UNBACKED_FEATURES as USE_MOCKS } from "@/constants/config";
import { deposits, transfers } from "@/constants/mockData";
import { Beneficiary, DepositRequest, DepositType, Transfer } from "@/constants/types";

import { apiRequest } from "./api";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
  if (USE_MOCKS) {
    await delay(150);
    const seen = new Set<string>();
    const result: Beneficiary[] = [];
    for (const t of transfers) {
      const key = t.ibanDestinataire.replace(/\s/g, "").toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ id: t.id, nom: t.destinataire, iban: t.ibanDestinataire });
    }
    return result;
  }
  // GET /api/transfers/beneficiaires
  return apiRequest<Beneficiary[]>("/transfers/beneficiaires");
}

export async function fetchTransfers(): Promise<Transfer[]> {
  if (USE_MOCKS) {
    await delay();
    return transfers;
  }
  // GET /api/transfers
  return apiRequest<Transfer[]>("/transfers");
}

export async function fetchTransferById(id: string): Promise<Transfer | undefined> {
  if (USE_MOCKS) {
    await delay(150);
    return transfers.find((t) => t.id === id);
  }
  // GET /api/transfers/:id
  return apiRequest<Transfer>(`/transfers/${id}`);
}

export interface CreateTransferInput {
  expediteur: string;
  ibanDestinataire: string;
  destinataire: string;
  montant: number;
  devise: string;
  motif: string;
}

export async function createTransfer(input: CreateTransferInput): Promise<Transfer> {
  if (USE_MOCKS) {
    await delay(700);
    const transfer: Transfer = {
      id: `t-mock-${Date.now()}`,
      reference: `VIR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-NEW`,
      montant: input.montant,
      devise: input.devise,
      expediteur: input.expediteur,
      destinataire: input.destinataire,
      ibanDestinataire: input.ibanDestinataire,
      motif: input.motif,
      date: new Date().toISOString(),
      statut: "en_attente",
    };
    return transfer;
  }
  // POST /api/transfers
  return apiRequest<Transfer>("/transfers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchDeposits(): Promise<DepositRequest[]> {
  if (USE_MOCKS) {
    await delay();
    return deposits;
  }
  // GET /api/deposits
  return apiRequest<DepositRequest[]>("/deposits");
}

export interface CreateDepositInput {
  type: DepositType;
  montant: number;
  devise: string;
  compte: string;
  agence?: string;
}

export async function createDepositRequest(input: CreateDepositInput): Promise<DepositRequest> {
  if (USE_MOCKS) {
    await delay(700);
    const deposit: DepositRequest = {
      id: `d-mock-${Date.now()}`,
      type: input.type,
      montant: input.montant,
      devise: input.devise,
      compte: input.compte,
      agence: input.agence,
      date: new Date().toISOString(),
      statut: "en_attente",
    };
    return deposit;
  }
  // POST /api/deposits
  return apiRequest<DepositRequest>("/deposits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}