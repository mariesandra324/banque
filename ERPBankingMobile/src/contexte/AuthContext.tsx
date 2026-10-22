import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { mobileLogin } from "@/modules/auth/authService";
import { setAuthToken, setCurrentClientId } from "@/services/api";
import {
  desenregistrerToken,
  enregistrerPushNotifications,
} from "@/services/pushNotifications";
import { User } from "@/constants/types";

interface SignInResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (nomComplet: string, motDePasse: string) => Promise<SignInResult>;
  signOut: () => void;
  updateUserPhoto: (uri: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (nomComplet: string, motDePasse: string) => {
    setIsLoading(true);
    try {
      const response = await mobileLogin({ nomComplet, motDePasse });
      if (!response.token) {
        throw new Error("Authentification refusée par le serveur.");
      }
      setAuthToken(response.token);
      setCurrentClientId(response.clientId ?? null);
      setUser({
        id: response.clientId,
        nom: response.nom,
        prenom: response.prenom,
        numeroCompte: response.numeroCompte ?? "",
        numeroCarte: response.numeroCarte ?? "",
        dateExpiration: response.dateExpiration,
        typeCompte: response.typeCompte ?? "",
        solde: response.solde ?? 0,
        email: response.email ?? undefined,
        telephone: response.telephone ?? undefined,
        adresse: response.adresse ?? undefined,
        cin: response.cin ?? undefined,
        dateNaissance: response.dateNaissance ?? undefined,
        photoUri: response.photoUri ?? null,
      });

      // Enregistrement du push : non bloquant, la session est déjà ouverte.
      // Le JWT est en place dans api.ts, l'appel backend peut donc partir.
      void enregistrerPushNotifications().catch(() => {
        // Permission refusée, pas de device, ou API injoignable :
        // le client reste connecté, seul le push est indisponible.
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Une erreur est survenue.",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    // Le push doit être coupé avant de perdre le JWT : l'API en a besoin.
    void desenregistrerToken().finally(() => {
      setAuthToken(null);
      setUser(null);
    });
  }, []);

  const updateUserPhoto = useCallback((uri: string | null) => {
    setUser((current) => (current ? { ...current, photoUri: uri } : current));
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut, updateUserPhoto }),
    [user, isLoading, signIn, signOut, updateUserPhoto]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}