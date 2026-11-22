import { USE_MOCKS } from "@/constants/config";
import { currentUser } from "@/constants/mockData";

import { apiRequest } from "@/services/api";

import {
  MobileChangePasswordRequest,
  MobileChangePasswordResponse,
  MobileForgotPasswordRequest,
  MobileForgotPasswordResponse,
  MobileInscriptionRequest,
  MobileInscriptionResponse,
  MobileLoginRequest,
  MobileLoginResponse,
  MobileResetPasswordRequest,
  MobileResetPasswordResponse,
  MobileVerifyOtpRequest,
  MobileVerifyOtpResponse,
} from "./auth.types";

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export async function mobileLogin(
  request: MobileLoginRequest
): Promise<MobileLoginResponse> {
  if (USE_MOCKS) {
    await delay();
    if (!request.nomComplet.trim() || !request.motDePasse.trim()) {
      throw new Error("Nom complet et mot de passe requis.");
    }
    return {
      token: "mock-token",
      clientId: 1,
      nom: currentUser.nom,
      prenom: currentUser.prenom,
      numeroCompte: currentUser.numeroCompte,
      numeroCarte: currentUser.numeroCarte,
      typeCompte: currentUser.typeCompte,
      solde: 0,
      email: currentUser.email,
      telephone: currentUser.telephone,
      adresse: currentUser.adresse,
      cin: currentUser.cin,
      dateNaissance: currentUser.dateNaissance,
      photoUri: currentUser.photoUri ?? null,
    };
  }
  // POST /api/auth/mobile/login
  return apiRequest<MobileLoginResponse>("/auth/mobile/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function mobileInscription(
  request: MobileInscriptionRequest
): Promise<MobileInscriptionResponse> {
  // POST /api/auth/mobile/inscription
  return apiRequest<MobileInscriptionResponse>("/auth/mobile/inscription", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function mobileChangePassword(
  request: MobileChangePasswordRequest
): Promise<MobileChangePasswordResponse> {
  // POST /api/auth/mobile/change-password
  // Le JWT de api.ts identifie le client : pas d'identifiant dans le body.
  // L'ancien mot de passe est revérifié côté serveur avant écriture.
  return apiRequest<MobileChangePasswordResponse>("/auth/mobile/change-password", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function mobileForgotPassword(
  request: MobileForgotPasswordRequest
): Promise<MobileForgotPasswordResponse> {
  return apiRequest<MobileForgotPasswordResponse>("/auth/mobile/forgot-password", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function mobileVerifyOtp(
  request: MobileVerifyOtpRequest
): Promise<MobileVerifyOtpResponse> {
  return apiRequest<MobileVerifyOtpResponse>("/auth/mobile/verify-otp", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function mobileResetPassword(
  request: MobileResetPasswordRequest
): Promise<MobileResetPasswordResponse> {
  return apiRequest<MobileResetPasswordResponse>("/auth/mobile/reset-password", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
