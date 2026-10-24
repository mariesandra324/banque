import React, { useState } from "react";

import {
  Alert,
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

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexte/AuthContext";

export default function LoginForm() {
  const { signIn, isLoading: authLoading } = useAuth();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  const [nomComplet, setNomComplet] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nomComplet.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre nom complet.");
      return;
    }
    if (!motDePasse.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre mot de passe.");
      return;
    }

    try {
      setLoading(true);
      const result = await signIn(nomComplet.trim(), motDePasse.trim());
      if (!result.ok) {
        Alert.alert("Connexion impossible", result.error ?? "Une erreur est survenue.");
        return;
      }
      router.replace("/tabs");
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || authLoading;

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
          <Text style={[styles.title, { color: theme.text }]}>ERP Banking</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Connectez-vous à votre compte
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Nom complet</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
            placeholder="Ex : Jean Rakoto"
            placeholderTextColor={theme.textSecondary}
            value={nomComplet}
            onChangeText={setNomComplet}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Mot de passe</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
              placeholder="Votre code personnel"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              value={motDePasse}
              onChangeText={setMotDePasse}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={10}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, busy && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {busy ? (authLoading ? "Patientez…" : "Connexion...") : "Se connecter"}
            </Text>
          </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/auth/forgot-password")}
          disabled={busy}
        >
          <Text style={[styles.registerText, { color: theme.primary }]}>
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.registerLink, { marginTop: 12 }]}
          onPress={() => router.push("/auth/register")}
          disabled={busy}
        >
          <Text style={[styles.registerText, { color: theme.textSecondary }]}>
            {"Vous n'avez pas d'accès mobile ? "}
            <Text style={[styles.registerTextBold, { color: theme.primary }]}>{"S'inscrire"}</Text>
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
  formContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  scrollWide: {
    paddingHorizontal: 48,
  },
  formContainerWide: {
    maxWidth: 480,
    padding: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.01)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
    ...(Platform.OS === "web" ? ({ boxShadow: "0 30px 60px -30px rgba(15,23,42,0.25)" } as any) : {}),
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 40,
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
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 16,
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
  registerLink: {
    marginTop: 18,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    textAlign: "center",
  },
  registerTextBold: {
    fontWeight: "700",
  },
});