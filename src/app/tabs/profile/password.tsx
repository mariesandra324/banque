import React, { useState } from "react";

import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/use-theme";
import { Radius, Spacing } from "@/constants/theme";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PasswordField } from "@/components/ui/password-field";
import { mobileChangePassword } from "@/modules/auth/authService";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/auth.types";

type FieldName = "ancien" | "nouveau" | "confirmation";

type Errors = Partial<Record<FieldName, string>>;

/** Écran « Modifier mon mot de passe » : ancien, nouveau, confirmation. */
export default function ChangePasswordScreen() {
  const theme = useTheme();

  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [envoi, setEnvoi] = useState(false);

  const valider = (): Errors => {
    const found: Errors = {};

    if (!ancien) found.ancien = "Saisissez votre mot de passe actuel.";
    if (nouveau.length < PASSWORD_MIN_LENGTH) {
      found.nouveau = `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
    }
    if (nouveau && nouveau === ancien) {
      found.nouveau = "Le nouveau mot de passe doit être différent de l'ancien.";
    }
    if (confirmation !== nouveau) {
      found.confirmation = "La confirmation ne correspond pas au nouveau mot de passe.";
    }

    return found;
  };

  const changer = async () => {
    const found = valider();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setEnvoi(true);
    try {
      const response = await mobileChangePassword({
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      });
      setAncien("");
      setNouveau("");
      setConfirmation("");
      Alert.alert(
        "Mot de passe modifié",
        response.message || "Votre mot de passe a été mis à jour."
      );
    } catch (error) {
      Alert.alert(
        "Changement impossible",
        error instanceof Error ? error.message : "Impossible de modifier le mot de passe."
      );
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
        <Section title="Mot de passe" caption="Sécurité" />

        <View style={[styles.aide, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
          <Text style={[styles.aideTexte, { color: theme.primary }]}>
            Choisissez un mot de passe d&apos;au moins {PASSWORD_MIN_LENGTH} caractères que vous
            seul connaissez. Il vous sera demandé à chaque connexion.
          </Text>
        </View>

        <PasswordField
          label="Mot de passe actuel"
          placeholder="Votre code personnel"
          value={ancien}
          onChangeText={setAncien}
          error={errors.ancien}
        />

        <PasswordField
          label="Nouveau mot de passe"
          placeholder="Au moins 6 caractères"
          value={nouveau}
          onChangeText={setNouveau}
          error={errors.nouveau}
        />

        <PasswordField
          label="Confirmer le nouveau mot de passe"
          placeholder="Saisissez-le à nouveau"
          value={confirmation}
          onChangeText={setConfirmation}
          error={errors.confirmation}
        />

        <Button
          title="Modifier le mot de passe"
          icon="key-outline"
          loading={envoi}
          onPress={changer}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  aide: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  aideTexte: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
