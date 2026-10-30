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

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexte/AuthContext";
import { Gradients, Radius, Shadows } from "@/constants/theme";

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
            isWide && {
              backgroundColor: theme.surface,
              borderColor: theme.line,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.brand}>
            <LinearGradient
              colors={Gradients.heroAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brandMark}
            >
              <Ionicons name="shield-checkmark" size={26} color="#ffffff" />
            </LinearGradient>
            <View>
              <Text style={[styles.brandName, { color: theme.text }]}>ERP Banking</Text>
              <Text style={[styles.brandCaption, { color: theme.textSecondary }]}>
                Espace client sécurisé
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Bienvenue</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Connectez-vous pour accéder à votre espace bancaire.
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Nom complet</Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ex : Jean Rakoto"
              placeholderTextColor={theme.textSecondary}
              value={nomComplet}
              onChangeText={setNomComplet}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={[styles.label, styles.labelInline, { color: theme.textSecondary }]}>
              Mot de passe
            </Text>
            <Pressable
              onPress={() => router.push("/auth/forgot-password")}
              disabled={busy}
              hitSlop={8}
            >
              <Text style={[styles.forgot, { color: theme.primary }]}>Oublié ?</Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
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
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              Shadows.card,
              { backgroundColor: theme.primary },
              pressed && styles.buttonPressed,
              busy && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {busy ? (authLoading ? "Patientez…" : "Connexion…") : "Se connecter"}
            </Text>
            {!busy && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
          </Pressable>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push("/auth/register")}
            disabled={busy}
          >
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>
              {"Pas encore d'accès mobile ? "}
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
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  brandCaption: {
    fontSize: 12,
    marginTop: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  labelInline: {
    marginBottom: 0,
  },
  forgot: {
    fontSize: 12,
    fontWeight: "700",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    padding: 0,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    height: 56,
    borderRadius: Radius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 26,
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
  registerLink: {
    marginTop: 22,
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