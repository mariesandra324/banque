import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

import { mobileForgotPassword } from "@/modules/auth/authService";
import { buildIdentifierPayload, isIdentifierValid } from "@/modules/auth/identifier";
import { useTheme } from "@/hooks/use-theme";
import { notify } from "@/utils/notify";

export default function ForgotPasswordForm() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = identifier.trim();
    if (!value) {
      notify("Erreur", "Veuillez saisir votre adresse e-mail, votre numÃ©ro de tÃ©lÃ©phone ou votre CIN.");
      return;
    }
    if (!isIdentifierValid(value)) {
      notify("Erreur", "Veuillez saisir un e-mail, un numÃ©ro de tÃ©lÃ©phone ou un CIN valide.");
      return;
    }

    const payload = buildIdentifierPayload(value);

    try {
      setLoading(true);
      const result = await mobileForgotPassword(payload);
      notify(
        "Code envoyÃ©",
        result.message ?? "Un code temporaire a Ã©tÃ© envoyÃ© Ã  l'adresse e-mail associÃ©e au compte.",
        [
          {
            text: "OK",
            onPress: () =>
              router.push({
                pathname: "/auth/reset-password",
                params: payload,
              }),
          },
        ]
      );
    } catch (error) {
      notify(
        "Erreur",
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formContainer, isWide && styles.formContainerWide]}>
          <Text style={[styles.title, { color: theme.text }]}>Mot de passe oubliÃ©</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Saisissez votre adresse e-mail, votre numÃ©ro de tÃ©lÃ©phone ou votre CIN enregistrÃ© dans votre compte.
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>E-mail, tÃ©lÃ©phone ou CIN</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
            placeholder="Ex : nom@domaine.com, 0341234567 ou CIN"
            placeholderTextColor={theme.textSecondary}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Envoi..." : "Envoyer le code"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              Retour Ã  la <Text style={[styles.linkTextBold, { color: theme.primary }]}>connexion</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  scrollWide: {
    paddingHorizontal: 48,
  },
  formContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  formContainerWide: {
    maxWidth: 480,
    padding: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
    ...(Platform.OS === "web" ? ({ boxShadow: "0 30px 60px -30px rgba(15,23,42,0.25)" } as any) : {}),
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    textAlign: "center",
  },
  linkTextBold: {
    fontWeight: "700",
  },
});

