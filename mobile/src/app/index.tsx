import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Redirect } from "expo-router";

import { useAuth } from "@/contexte/AuthContext";
import { getBiometricCredentials } from "@/services/biometricCredentials";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [destination, setDestination] = useState<
    "/tabs" | "/auth/login" | "/auth/biometric" | null
  >(null);

  useEffect(() => {
    if (isLoading || user) return;

    let active = true;
    getBiometricCredentials()
      .then((credentials) => {
        if (active) setDestination(credentials ? "/auth/biometric" : "/auth/login");
      })
      .catch((error) => {
        if (!active) return;
        Alert.alert(
          "Connexion biométrique",
          error instanceof Error
            ? error.message
            : "Impossible de vérifier les identifiants sécurisés."
        );
        setDestination("/auth/login");
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading) return null;
  if (user) return <Redirect href="/tabs" />;
  return destination ? <Redirect href={destination} /> : null;
}