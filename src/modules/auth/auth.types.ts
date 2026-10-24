export interface MobileLoginRequest {
  nomComplet: string;
  motDePasse: string;
}

export interface MobileLoginResponse {
  token: string;
  clientId: number;
  nom: string;
  prenom: string;
  numeroCompte?: string | null;
  numeroCarte?: string | null;
  dateExpiration?: string;
  typeCompte?: string | null;
  solde?: number | null;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  cin?: string | null;
  dateNaissance?: string | null;
  photoUri?: string | null;
}

export interface MobileInscriptionRequest {
  cin: string;
  nomComplet: string;
  motDePasse: string;
}

export interface MobileInscriptionResponse {
  message: string;
  statut: string;
}

/** Politique de mot de passe alignée sur la validation de l'inscription. */
export const PASSWORD_MIN_LENGTH = 6;

export interface MobileChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface MobileChangePasswordResponse {
  message: string;
}

export interface MobileForgotPasswordRequest {
  cin?: string;
  email?: string;
  telephone?: string;
}

export interface MobileForgotPasswordResponse {
  message: string;
}

export interface MobileVerifyOtpRequest {
  cin?: string;
  email?: string;
  telephone?: string;
  code: string;
}

export interface MobileVerifyOtpResponse {
  message: string;
  valid: boolean;
}

export interface MobileResetPasswordRequest {
  cin?: string;
  email?: string;
  telephone?: string;
  code: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse?: string;
}

export interface MobileResetPasswordResponse {
  message: string;
}
