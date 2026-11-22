import { USE_MOCKS } from "@/constants/config";
import { creditOffers, creditRequests, loans } from "@/constants/mockData";
import { CreditOffer, CreditRequest, Echeance, Loan } from "@/constants/types";

import { apiRequest, apiMultipartRequest, getCurrentClientId } from "./api";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// =========================================================
// DTO backend (offres-credit / demandes-credit / credits)
// =========================================================

interface OffreCreditBackend {
  id: number;
  numeroOffre: string;
  demandeCreditId: number;
  demandeProfession?: string;
  demandeTypeContrat?: string;
  demandeMotif?: string;
  demandeDateDecision?: string;
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
  montantPropose: number;
  tauxInteret: number;
  duree: number;
  mensualite: number;
  dateOffre: string;
  dateDebut?: string;
  dateExpiration?: string;
  conditions?: string;
  statut: string;
}

interface DemandeCreditBackend {
  id: number;
  montantDemande: number;
  duree: number;
  tauxInteret?: number;
  motif?: string;
  dateDemande: string;
  statut: string;
  dateDecision?: string;
  motifRejet?: string;
}

interface CreditBackend {
  id: number;
  numeroCredit: string;
  montant: number;
  tauxInteret: number;
  duree: number;
  mensualite: number;
  dateDebut: string;
  capitalRestant: number;
  statut: string;
  demandeCreditId: number;
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
}

interface EcheanceBackend {
  id: number;
  numeroEcheance: number;
  dateEcheance: string;
  montant: number;
  capital: number;
  interet: number;
  capitalRestant: number;
  statut: string;
}

// =========================================================
// Mappers
// =========================================================

function toCreditOffer(o: OffreCreditBackend): CreditOffer {
  return {
    id: String(o.id),
    titre: `Offre ${o.numeroOffre || o.id}`,
    description: o.conditions ?? o.demandeMotif ?? "",
    montantMax: o.montantPropose,
    tauxAnnuel: o.tauxInteret,
    dureeMaxMois: o.duree,
    mensualite: o.mensualite,
    devise: "MGA",
    statut: o.statut,
    numeroOffre: o.numeroOffre,
    dateExpiration: o.dateExpiration,
  };
}

function mapDemandeStatut(statut: string): CreditRequest["statut"] {
  switch (statut?.toUpperCase()) {
    case "ACCEPTER":
      return "accepte";
    case "REJETER":
    case "ANNULER":
      return "refuse";
    default:
      return "en_attente";
  }
}

function toCreditRequest(d: DemandeCreditBackend): CreditRequest {
  return {
    id: String(d.id),
    montant: d.montantDemande,
    devise: "MGA",
    dureeMois: d.duree,
    motif: d.motif ?? "",
    statut: mapDemandeStatut(d.statut),
    date: d.dateDemande,
  };
}

function mapCreditStatut(statut: string): Loan["statut"] {
  switch (statut?.toUpperCase()) {
    case "TERMINE":
    case "SOLDE":
      return "rembourse";
    case "ANNULE":
      return "refuse";
    default:
      return "en_cours";
  }
}

function toEcheance(e: EcheanceBackend): Echeance {
  return {
    id: e.id,
    numero: e.numeroEcheance,
    date: e.dateEcheance,
    capital: e.capital,
    interets: e.interet,
    total: e.montant,
    restantApres: e.capitalRestant,
    payee: e.statut?.toUpperCase() === "PAYEE",
  };
}

function toLoan(c: CreditBackend, echeances: Echeance[] = []): Loan {
  const next = echeances.find((e) => !e.payee);
  return {
    id: String(c.id),
    reference: c.numeroCredit,
    montant: c.montant,
    devise: "MGA",
    tauxAnnuel: c.tauxInteret,
    dureeMois: c.duree,
    mensualite: c.mensualite,
    resteDu: c.capitalRestant,
    statut: mapCreditStatut(c.statut),
    debutAt: c.dateDebut,
    prochaineEcheance: next?.date,
    echeances,
  };
}

// =========================================================
// Offres de crédit
// =========================================================

export async function fetchCreditOffers(): Promise<CreditOffer[]> {
  if (USE_MOCKS) {
    await delay();
    return creditOffers;
  }
  const clientId = getCurrentClientId();
  if (clientId == null) return [];
  // GET /api/offres-credit/client/{clientId}
  const raw = await apiRequest<OffreCreditBackend[]>(`/offres-credit/client/${clientId}`);
  return (raw ?? []).map(toCreditOffer);
}

export async function fetchCreditOfferById(id: string): Promise<CreditOffer | undefined> {
  if (USE_MOCKS) {
    await delay(150);
    return creditOffers.find((o) => o.id === id);
  }
  // GET /api/offres-credit/:id
  const raw = await apiRequest<OffreCreditBackend>(`/offres-credit/${id}`);
  return raw ? toCreditOffer(raw) : undefined;
}

export async function acceptCreditOffer(id: string): Promise<void> {
  if (USE_MOCKS) {
    await delay(700);
    return;
  }
  // PUT /api/offres-credit/{id}/accepter (crée le crédit + échéancier)
  await apiRequest<void>(`/offres-credit/${id}/accepter`, { method: "PUT" });
}

export async function refuseCreditOffer(id: string): Promise<void> {
  if (USE_MOCKS) {
    await delay(700);
    return;
  }
  // PUT /api/offres-credit/{id}/statut/REFUSEE
  await apiRequest<void>(`/offres-credit/${id}/statut/REFUSEE`, { method: "PUT" });
}

// =========================================================
// Demandes de crédit
// =========================================================

export async function fetchCreditRequests(): Promise<CreditRequest[]> {
  if (USE_MOCKS) {
    await delay();
    return creditRequests;
  }
  const clientId = getCurrentClientId();
  if (clientId == null) return [];
  // GET /api/demandes-credit/client/{clientId}
  const raw = await apiRequest<DemandeCreditBackend[]>(`/demandes-credit/client/${clientId}`);
  return (raw ?? []).map(toCreditRequest);
}

export interface CreateCreditRequestInput {
  montant: number;
  devise: string;
  dureeMois: number;
  motif: string;
  pieces?: CreditPiece[];
  compteId?: number;
}

export interface CreditPiece {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  file?: File;
}

export async function createCreditRequest(input: CreateCreditRequestInput): Promise<CreditRequest> {
  if (USE_MOCKS) {
    await delay(700);
    return {
      id: `cr-mock-${Date.now()}`,
      montant: input.montant,
      devise: input.devise,
      dureeMois: input.dureeMois,
      motif: input.motif,
      statut: "en_attente",
      date: new Date().toISOString(),
    };
  }
  const clientId = getCurrentClientId();
  if (clientId == null) {
    throw new Error("Client non identifié.");
  }
  // POST /api/demandes-credit (multipart, champs "demande" + "pieces")
  const form = new FormData();
  form.append(
    "demande",
    JSON.stringify({
      montantDemande: input.montant,
      duree: input.dureeMois,
      motif: input.motif,
      clientId,
      compteId: input.compteId,
    })
  );
  for (const piece of input.pieces ?? []) {
    if (piece.file) {
      // Web : on envoie le vrai File
      form.append("pieces", piece.file);
    } else {
      // React Native : objet { uri, name, type }
      form.append(
        "pieces",
        {
          uri: piece.uri,
          name: piece.name,
          type: piece.mimeType ?? "application/octet-stream",
        } as unknown as Blob
      );
    }
  }
  const raw = await apiMultipartRequest<DemandeCreditBackend>("/demandes-credit", form);
  return toCreditRequest(raw);
}

// =========================================================
// Crédits (prêts) et remboursements
// =========================================================

export async function fetchLoanEcheances(id: string): Promise<Echeance[]> {
  if (USE_MOCKS) {
    await delay(150);
    const loan = loans.find((l) => l.id === id);
    return loan?.echeances ?? [];
  }
  // GET /api/credits/{id}/echeancier
  const raw = await apiRequest<EcheanceBackend[]>(`/credits/${id}/echeancier`);
  return (raw ?? []).map(toEcheance);
}

export async function fetchLoans(): Promise<Loan[]> {
  if (USE_MOCKS) {
    await delay();
    return loans;
  }
  const clientId = getCurrentClientId();
  if (clientId == null) return [];
  // GET /api/credits/client/{clientId}
  const raw = await apiRequest<CreditBackend[]>(`/credits/client/${clientId}`);
  return Promise.all((raw ?? []).map(async (c) => toLoan(c, await fetchLoanEcheances(String(c.id)))));
}

export async function fetchLoanById(id: string): Promise<Loan | undefined> {
  if (USE_MOCKS) {
    await delay(150);
    return loans.find((l) => l.id === id);
  }
  // GET /api/credits/{id} + echeancier
  const raw = await apiRequest<CreditBackend>(`/credits/${id}`);
  if (!raw) return undefined;
  const echeances = await fetchLoanEcheances(id);
  return toLoan(raw, echeances);
}

export async function reimburseEcheance(
  creditId: string,
  echeanceId: number
): Promise<void> {
  if (USE_MOCKS) {
    await delay(700);
    return;
  }
  // POST /api/credits/{creditId}/remboursement/{echeanceId}
  await apiRequest<void>(`/credits/${creditId}/remboursement/${echeanceId}`, {
    method: "POST",
  });
}