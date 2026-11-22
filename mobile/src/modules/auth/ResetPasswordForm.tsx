import React, { useRef, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";

import { mobileResetPassword, mobileVerifyOtp } from "@/modules/auth/authService";
import { buildIdentifierPayload } from "@/modules/auth/identifier";
import { AuthBrand } from "@/components/ui/auth-brand";
import { Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { notify } from "@/utils/notify";

export default function ResetPasswordForm() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const params = useLocalSearchParams<{ cin?: string; telephone?: string; email?: string }>();
  const [identifier, setIdentifier] = useState(params.email ?? params.telephone ?? params.cin ?? "");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const code = codeDigits.join("");
  const updateCodeAt = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };
  const handleCodeKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !codeDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const buildPayload = () => ({ ...buildIdentifierPayload(identifier) });

  const handleVerify = async () => {
    const value = identifier.trim();
    if (!value) {
      notify("Erreur", "Veuillez saisir votre identifiant.");
      return;
    }
    if (!code.trim()) {
      notify("Erreur", "Veuillez saisir le code reçu par e-mail.");
      return;
    }
    const payload = { ...buildPayload(), code: code.trim() };
    if (!payload.email && !payload.telephone && !payload.cin) {
      notify("Erreur", "Identifiant invalide.");
      return;
    }

    try {
      setVerifying(true);
      const result = await mobileVerifyOtp(payload);
      if (result.valid) {
        setVerified(true);
        notify("Vérification réussie", "Vous pouvez maintenant choisir votre nouveau mot de passe.");
      } else {
        notify("Erreur", result.message ?? "Code invalide ou expiré.");
      }
    } catch (error) {
      notify("Erreur", error instanceof Error ? error.message : "Code invalide ou expiré.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!verified) {
      notify("Vérification requise", "Veuillez d'abord vérifier le code OTP.");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      notify("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      notify("Erreur", "Les deux mots de passe ne correspondent pas.");
      return;
    }

    const payload = {
      ...buildPayload(),
      code: code.trim(),
      nouveauMotDePasse,
      confirmationMotDePasse: confirmation,
    };
    try {
      setLoading(true);
      const result = await mobileResetPassword(payload);
      notify("Réinitialisation réussie", result.message ?? "Votre mot de passe a été réinitialisé.", [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } catch (error) {
      notify("Erreur", error instanceof Error ? error.message : "Une erreur est survenue.");
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
          <AuthBrand caption="Sécurisation du compte" />

          <Text style={[styles.title, { color: theme.text }]}>
            Vérification & nouveau mot de passe
          </Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Étape 1 : saisissez le code envoyé par e-mail. Étape 2 : définissez votre nouveau
            mot de passe.
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>E-mail, téléphone ou CIN</Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface, borderColor: theme.line },
              verified && { borderColor: theme.success },
            ]}
          >
            <Ionicons name="at-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Identifiant utilisé pour la demande"
              placeholderTextColor={theme.textSecondary}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!verified}
            />
          </View>

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 18 }]}>
            Code OTP reçu par e-mail
          </Text>
          <View style={styles.codeRow}>
            {codeDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputsRef.current[index] = ref;
                }}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: theme.surface,
                    borderColor: verified ? theme.success : theme.line,
                    color: theme.text,
                  },
                ]}
                value={digit}
                onChangeText={(value) => updateCodeAt(index, value)}
                onKeyPress={({ nativeEvent }) => handleCodeKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                editable={!verified && !verifying}
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              Shadows.card,
              { backgroundColor: verifying || verified ? theme.success : theme.primary },
              pressed && styles.buttonPressed,
              (verifying || verified) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={verifying || verified}
          >
            {verified && <Ionicons name="checkmark-circle" size={18} color="#ffffff" />}
            <Text style={styles.buttonText}>
              {verified ? "Code vérifié" : verifying ? "Vérification…" : "Vérifier le code"}
            </Text>
          </Pressable>

          {verified && (
            <>
              <Text
                style={[styles.label, { color: theme.textSecondary, marginTop: 22 }]}
              >
                Nouveau mot de passe
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Au moins 6 caractères"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  value={nouveauMotDePasse}
                  onChangeText={setNouveauMotDePasse}
                  autoCapitalize="none"
                />
              </View>

              <Text
                style={[styles.label, { color: theme.textSecondary, marginTop: 18 }]}
              >
                Confirmer le nouveau mot de passe
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Re-saisissez le mot de passe"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  value={confirmation}
                  onChangeText={setConfirmation}
                  autoCapitalize="none"
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
                  {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                </Text>
                {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
              </Pressable>
            </>
          )}

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.replace("/auth/login")}
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
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  scrollWide: { paddingHorizontal: 48 },
  formContainer: { width: "100%", maxWidth: 440, alignSelf: "center" },
  formContainerWide: {
    maxWidth: 480,
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
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
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
  input: { flex: 1, height: "100%", fontSize: 15, padding: 0 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  codeBox: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 22,
    fontWeight: "700",
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  link: { marginTop: 20, alignItems: "center" },
  linkText: { fontSize: 14, textAlign: "center" },
  linkTextBold: { fontWeight: "700" },
});

