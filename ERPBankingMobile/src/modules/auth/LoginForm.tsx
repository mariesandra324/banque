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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexte/AuthContext";

export default function LoginForm() {
  const { signIn, isLoading: authLoading } = useAuth();
  const theme = useTheme();

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
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
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
          onPress={() => router.push("/auth/register")}
          disabled={busy}
        >
          <Text style={[styles.registerText, { color: theme.textSecondary }]}>
            {"Vous n'avez pas d'accès mobile ? "}
            <Text style={[styles.registerTextBold, { color: theme.primary }]}>{"S'inscrire"}</Text>
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 25,
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
    marginTop: 24,
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