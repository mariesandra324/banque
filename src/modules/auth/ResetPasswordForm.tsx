import React, { useRef, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";

import { mobileResetPassword, mobileVerifyOtp } from "@/modules/auth/authService";
import { buildIdentifierPayload } from "@/modules/auth/identifier";
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
      notify("Erreur", "Veuillez saisir le code reÃ§u par e-mail.");
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
        notify("VÃ©rification rÃ©ussie", "Vous pouvez maintenant choisir votre nouveau mot de passe.");
      } else {
        notify("Erreur", result.message ?? "Code invalide ou expirÃ©.");
      }
    } catch (error) {
      notify("Erreur", error instanceof Error ? error.message : "Code invalide ou expirÃ©.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!verified) {
      notify("VÃ©rification requise", "Veuillez d'abord vÃ©rifier le code OTP.");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      notify("Erreur", "Le mot de passe doit contenir au moins 6 caractÃ¨res.");
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
      notify("RÃ©initialisation rÃ©ussie", result.message ?? "Votre mot de passe a Ã©tÃ© rÃ©initialisÃ©.", [
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
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formContainer, isWide && styles.formContainerWide]}>
          <Text style={[styles.title, { color: theme.text }]}>VÃ©rification & Nouveau mot de passe</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ã‰tape 1 : saisissez le code envoyÃ© par e-mail. Ã‰tape 2 : dÃ©finissez votre nouveau mot de passe.
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>E-mail, tÃ©lÃ©phone ou CIN</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            placeholder="Identifiant utilisÃ© pour la demande"
            placeholderTextColor={theme.textSecondary}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!verified}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Code OTP reÃ§u par e-mail</Text>
          <View style={styles.codeRow}>
            {codeDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputsRef.current[index] = ref;
                }}
                style={[styles.codeBox, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: verified ? "#22C55E" : "transparent" }]}
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

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, (verifying || verified) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={verifying || verified}
          >
            <Text style={styles.buttonText}>
              {verified ? "Code vÃ©rifiÃ©" : verifying ? "VÃ©rification..." : "VÃ©rifier le code"}
            </Text>
          </TouchableOpacity>

          {verified && (
            <>
              <Text style={[styles.label, { color: theme.textSecondary, marginTop: 12 }]}>Nouveau mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="Au moins 6 caractÃ¨res"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={nouveauMotDePasse}
                onChangeText={setNouveauMotDePasse}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                placeholder="Re-saisissez le mot de passe"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={confirmation}
                onChangeText={setConfirmation}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.link} onPress={() => router.replace("/auth/login")} disabled={loading}>
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
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 25, paddingVertical: 30 },
  scrollWide: { paddingHorizontal: 48 },
  formContainer: { width: "100%", maxWidth: 420, alignSelf: "center" },
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
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { textAlign: "center", fontSize: 14, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { height: 55, borderWidth: 1, borderColor: "transparent", borderRadius: 12, paddingHorizontal: 15, fontSize: 16, marginBottom: 18 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 18 },
  codeBox: { flex: 1, height: 56, borderWidth: 1, borderRadius: 12, fontSize: 22, fontWeight: "700" },
  button: { height: 55, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  link: { marginTop: 18, alignItems: "center" },
  linkText: { fontSize: 14, textAlign: "center" },
  linkTextBold: { fontWeight: "700" },
});

