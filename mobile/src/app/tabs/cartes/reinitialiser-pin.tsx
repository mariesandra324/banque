import { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { resetCartePin } from "@/services/cartesService";

export default function ResetCartePinScreen() {
  const theme = useTheme();
  const { carteId } = useLocalSearchParams<{ carteId: string }>();
  const [code, setCode] = useState("");
  const [nouveauPin, setNouveauPin] = useState("");
  const [confirmationPin, setConfirmationPin] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [termine, setTermine] = useState(false);

  const confirmer = async () => {
    setErreur("");
    if (!/^\d{6}$/.test(code)) {
      setErreur("Saisissez le code à 6 chiffres reçu par e-mail.");
      return;
    }
    if (!/^\d{4}$/.test(nouveauPin)) {
      setErreur("Le nouveau PIN doit contenir exactement 4 chiffres.");
      return;
    }
    if (nouveauPin !== confirmationPin) {
      setErreur("Les deux PIN ne correspondent pas.");
      return;
    }
    if (!carteId) {
      setErreur("La carte à réinitialiser est introuvable.");
      return;
    }

    setEnvoi(true);
    try {
      await resetCartePin(carteId, { code, nouveauPin, confirmationPin });
      setTermine(true);
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "La réinitialisation a échoué.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <Screen>
        <BackButton />
        <Section title="Réinitialiser mon PIN" caption="Sécurité de la carte" />

        <Text style={{ color: theme.textSecondary, lineHeight: 21 }}>
          Saisissez le code de vérification reçu par e-mail, puis choisissez un nouveau PIN à 4 chiffres.
        </Text>

        {termine ? (
          <View style={[styles.success, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.successText, { color: theme.primary }]}>
              PIN mis à jour. Vous pouvez maintenant utiliser ce PIN pour accéder à vos comptes et consulter vos opérations.
            </Text>
            <Button
              title="Retour à mes cartes"
              onPress={() => router.replace("/tabs/cartes")}
            />
          </View>
        ) : (
          <>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Code reçu par e-mail</Text>
              <TextInput
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.line, color: theme.text }]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Nouveau PIN (4 chiffres)</Text>
              <TextInput
                value={nouveauPin}
                onChangeText={(value) => setNouveauPin(value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.line, color: theme.text }]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmer le nouveau PIN</Text>
              <TextInput
                value={confirmationPin}
                onChangeText={(value) => setConfirmationPin(value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.line, color: theme.text }]}
              />
            </View>

            {erreur ? <Text style={[styles.error, { color: theme.danger }]}>{erreur}</Text> : null}
            <Button
              title="Confirmer le nouveau PIN"
              icon="shield-checkmark-outline"
              loading={envoi}
              onPress={confirmer}
            />
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    fontSize: 17,
    letterSpacing: 3,
  },
  error: {
    fontSize: 13,
  },
  success: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  successText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
