import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/contexte/AuthContext";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getBiometricCredentials } from "@/services/biometricCredentials";

export default function BiometricLoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [credentials, setCredentials] = useState<{
    nomComplet: string;
    motDePasse: string;
  } | null>(null);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    let active = true;

    const prepare = async () => {
      try {
        const savedCredentials = await getBiometricCredentials();
        if (!savedCredentials) {
          router.replace("/auth/login");
          return;
        }

        const available =
          Platform.OS !== "web" &&
          (await LocalAuthentication.hasHardwareAsync()) &&
          (await LocalAuthentication.isEnrolledAsync());
        if (active) {
          setCredentials(savedCredentials);
          setBiometricsAvailable(available);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            "Connexion biométrique",
            error instanceof Error
              ? error.message
              : "Impossible de préparer la connexion biométrique."
          );
          router.replace("/auth/login");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void prepare();
    return () => {
      active = false;
    };
  }, []);

  const connectWithBiometrics = async () => {
    if (!credentials || authenticating) return;

    setAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmez votre identité pour vous connecter",
        cancelLabel: "Annuler",
        disableDeviceFallback: true,
      });
      if (!result.success) {
        if (result.error !== "user_cancel" && result.error !== "app_cancel") {
          Alert.alert(
            "Authentification refusée",
            "Votre empreinte n'a pas été reconnue. Vous pouvez réessayer ou utiliser votre mot de passe."
          );
        }
        return;
      }

      const signInResult = await signIn(credentials.nomComplet, credentials.motDePasse);
      if (!signInResult.ok) {
        Alert.alert(
          "Connexion impossible",
          signInResult.error ?? "Veuillez vous connecter avec votre mot de passe."
        );
        return;
      }
      router.replace("/tabs");
    } catch (error) {
      Alert.alert(
        "Connexion impossible",
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <Screen center style={styles.content}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name="finger-print-outline" size={52} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Bienvenue</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {biometricsAvailable
          ? "Utilisez votre empreinte pour accéder à votre espace bancaire."
          : "La biométrie n'est pas disponible sur cet appareil. Connectez-vous avec votre mot de passe."}
      </Text>

      {biometricsAvailable && (
        <Button
          title="Se connecter avec mon empreinte"
          icon="finger-print-outline"
          loading={authenticating || loading}
          disabled={!credentials || loading}
          onPress={connectWithBiometrics}
        />
      )}
      <Button
        title="Se connecter avec mon mot de passe"
        variant="secondary"
        icon="key-outline"
        disabled={loading}
        onPress={() => router.replace("/auth/login")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
});
