import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_CREDENTIALS_KEY = "biometric-login-credentials";

export interface BiometricCredentials {
  nomComplet: string;
  motDePasse: string;
}

export async function getBiometricCredentials(): Promise<BiometricCredentials | null> {
  if (Platform.OS === "web") return null;

  const stored = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  if (!stored) return null;

  try {
    const credentials: unknown = JSON.parse(stored);
    if (
      typeof credentials === "object" &&
      credentials !== null &&
      "nomComplet" in credentials &&
      "motDePasse" in credentials &&
      typeof credentials.nomComplet === "string" &&
      typeof credentials.motDePasse === "string" &&
      credentials.nomComplet.trim() &&
      credentials.motDePasse
    ) {
      return {
        nomComplet: credentials.nomComplet,
        motDePasse: credentials.motDePasse,
      };
    }
  } catch {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    return null;
  }

  await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  return null;
}

export async function saveBiometricCredentials(
  credentials: BiometricCredentials
): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("La connexion biométrique est disponible uniquement sur mobile.");
  }

  await SecureStore.setItemAsync(
    BIOMETRIC_CREDENTIALS_KEY,
    JSON.stringify(credentials)
  );
}

export async function removeBiometricCredentials(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
}

export async function updateBiometricCredentialsIfEnabled(
  credentials: BiometricCredentials
): Promise<void> {
  if (Platform.OS === "web") return;
  if (await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY)) {
    await saveBiometricCredentials(credentials);
  }
}
