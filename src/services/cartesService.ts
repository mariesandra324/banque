import { Account } from "@/constants/types";

import { apiRequest } from "./api";

export interface CarteInfo {
  id: number;
  numeroCarte: string;
  dateExpiration: string;
  typeCarte: string;
  statut: string;
  compteId: number;
  pinResetPending?: boolean;
}

export async function fetchCardByCompteId(compteId: string | number): Promise<CarteInfo | null> {
  try {
    // GET /api/cartes/compte/{compteId}
    return await apiRequest<CarteInfo>(`/cartes/compte/${compteId}`);
  } catch {
    return null;
  }
}

export async function fetchCardsForAccounts(accounts: Account[]): Promise<Map<string, CarteInfo>> {
  const entries = await Promise.all(
    accounts.map(async (account) => {
      const carte = await fetchCardByCompteId(account.id);
      return [account.id, carte] as const;
    })
  );
  const result = new Map<string, CarteInfo>();
  entries.forEach(([accountId, carte]) => {
    if (carte) result.set(accountId, carte);
  });
  return result;
}

export async function resetCartePin(
  carteId: string | number,
  request: { code: string; nouveauPin: string; confirmationPin: string }
): Promise<void> {
  await apiRequest<void>(`/cartes/${carteId}/confirmer-reinitialisation-pin`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}