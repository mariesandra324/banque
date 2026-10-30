import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { mobileForgotPassword } from "@/modules/auth/authService";
import { buildIdentifierPayload, isIdentifierValid } from "@/modules/auth/identifier";
import { AuthBrand } from "@/components/ui/auth-brand";
import { Shadows } from "@/constants/theme";
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
      notify("Erreur", "Veuillez saisir votre adresse e-mail, votre numéro de téléphone ou votre CIN.");
      return;
    }
    if (!isIdentifierValid(value)) {
      notify("Erreur", "Veuillez saisir un e-mail, un numéro de téléphone ou un CIN valide.");
      return;
    }

    const payload = buildIdentifierPayload(value);

    try {
      setLoading(true);
      const result = await mobileForgotPassword(payload);
      notify(
        "Code envoyé",
        result.message ?? "Un code temporaire a été envoyé à l'adresse e-mail associée au compte.",
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
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[theme.backgroundTop, theme.backgroundBottom]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.formContainer,
            isWide && styles.formContainerWide,
            isWide && { backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1 },
          ]}
        >
          <AuthBrand />

          <Text style={[styles.title, { color: theme.text }]}>Mot de passe oublié</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Saisissez votre adresse e-mail, votre numéro de téléphone ou votre CIN enregistré
            dans votre compte.
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Identifiant</Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Ionicons name="at-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="E-mail, téléphone ou CIN"
              placeholderTextColor={theme.textSecondary}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              Shadows.card,
              { backgroundColor: theme.primary },
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Envoi…" : "Envoyer le code"}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
          </Pressable>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              Retour à la <Text style={[styles.linkTextBold, { color: theme.primary }]}>connexion</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
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
    maxWidth: 460,
    padding: 40,
    borderRadius: 28,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 10,
    ...(Platform.OS === "web" ? ({ boxShadow: "0 30px 70px -30px rgba(15,23,42,0.28)" } as any) : {}),
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    padding: 0,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
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

