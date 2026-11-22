import React, { useCallback, useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/use-theme";
import { Radius, Shadows, Spacing } from "@/constants/theme";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { BackButton } from "@/components/ui/back-button";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  NotificationPreference,
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "@/services/notificationsService";
import { useAuth } from "@/contexte/AuthContext";
import {
  getBiometricCredentials,
  removeBiometricCredentials,
  saveBiometricCredentials,
} from "@/services/biometricCredentials";
import { mobileLogin } from "@/modules/auth/authService";

/**
 * Préférences de notification.
 *
 * Le backend expose le catalogue complet via GET /api/notifications/preferences
 * et respecte `pushActive` avant tout envoi FCM. On ne montre que les types
 * dont le roleCible est CLIENT, les autres ne concernant pas l'utilisateur mobile.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { data, loading, reload } = useAsyncData<NotificationPreference[]>(
    fetchNotificationPreferences,
    []
  );
  const [modifiees, setModifiees] = useState<Record<string, boolean>>({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [biometrieActive, setBiometrieActive] = useState(false);
  const [biometrieDisponible, setBiometrieDisponible] = useState(false);
  const [chargementBiometrie, setChargementBiometrie] = useState(true);
  const [modalBiometrie, setModalBiometrie] = useState(false);
  const [nomComplet, setNomComplet] = useState(
    user ? `${user.prenom} ${user.nom}`.trim() : ""
  );
  const [motDePasse, setMotDePasse] = useState("");
  const [activationEnCours, setActivationEnCours] = useState(false);

  useEffect(() => {
    let active = true;

    const chargerBiometrie = async () => {
      try {
        const [credentials, hasHardware, isEnrolled] = await Promise.all([
          getBiometricCredentials(),
          Platform.OS === "web" ? Promise.resolve(false) : LocalAuthentication.hasHardwareAsync(),
          Platform.OS === "web" ? Promise.resolve(false) : LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!active) return;
        setBiometrieActive(Boolean(credentials));
        setBiometrieDisponible(hasHardware && isEnrolled);
      } catch (error) {
        if (active) {
          Alert.alert(
            "Paramètres biométriques",
            error instanceof Error ? error.message : "Impossible de lire les paramètres biométriques."
          );
        }
      } finally {
        if (active) setChargementBiometrie(false);
      }
    };

    void chargerBiometrie();
    return () => {
      active = false;
    };
  }, []);

  const preferences = (data ?? []).filter((p) => p.roleCible === "CLIENT");

  const basculer = useCallback((type: string, valeur: boolean) => {
    setModifiees((current) => ({ ...current, [type]: valeur }));
  }, []);

  const enregistrer = useCallback(async () => {
    setEnregistrement(true);

    try {
      const aEnvoyer = preferences.map((p) => ({
        ...p,
        pushActive: modifiees[p.type] ?? p.pushActive,
      }));

      await saveNotificationPreferences(aEnvoyer);
      setModifiees({});
      await reload();
      Alert.alert("Paramètres", "Vos préférences ont été enregistrées.", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert(
        "Paramètres",
        error instanceof Error ? error.message : "Impossible d'enregistrer les préférences."
      );
    } finally {
      setEnregistrement(false);
    }
  }, [preferences, modifiees, reload]);

  const basculerBiometrie = useCallback(
    async (activer: boolean) => {
      if (activer) {
        if (!biometrieDisponible) {
          Alert.alert(
            "Biométrie indisponible",
            "Configurez une empreinte ou une reconnaissance faciale dans les réglages de votre téléphone, puis réessayez."
          );
          return;
        }
        setNomComplet(user ? `${user.prenom} ${user.nom}`.trim() : "");
        setMotDePasse("");
        setModalBiometrie(true);
        return;
      }

      Alert.alert(
        "Désactiver la connexion biométrique ?",
        "Vos identifiants enregistrés sur cet appareil seront supprimés.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Désactiver",
            style: "destructive",
            onPress: () => {
              void removeBiometricCredentials()
                .then(() => setBiometrieActive(false))
                .catch((error) =>
                  Alert.alert(
                    "Désactivation impossible",
                    error instanceof Error ? error.message : "Impossible de supprimer les identifiants."
                  )
                );
            },
          },
        ]
      );
    },
    [biometrieDisponible, user]
  );

  const activerBiometrie = useCallback(async () => {
    if (!nomComplet.trim() || !motDePasse) {
      Alert.alert("Informations requises", "Saisissez votre nom complet et votre mot de passe.");
      return;
    }

    setActivationEnCours(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmez votre identité pour activer la connexion biométrique",
        cancelLabel: "Annuler",
        disableDeviceFallback: true,
      });
      if (!result.success) {
        if (result.error !== "user_cancel" && result.error !== "app_cancel") {
          Alert.alert(
            "Activation refusée",
            "L'authentification biométrique a échoué. Vérifiez le réglage de votre appareil et réessayez."
          );
        }
        return;
      }

      const verifiedAccount = await mobileLogin({
        nomComplet: nomComplet.trim(),
        motDePasse,
      });
      if (!user || verifiedAccount.clientId !== user.id) {
        throw new Error("Ces identifiants ne correspondent pas au compte actuellement connecté.");
      }

      await saveBiometricCredentials({
        nomComplet: nomComplet.trim(),
        motDePasse,
      });
      setBiometrieActive(true);
      setModalBiometrie(false);
      setMotDePasse("");
      Alert.alert("Connexion biométrique activée", "Vous pourrez l'utiliser à l'ouverture de l'application.");
    } catch (error) {
      Alert.alert(
        "Activation impossible",
        error instanceof Error ? error.message : "Impossible d'enregistrer les identifiants sécurisés."
      );
    } finally {
      setActivationEnCours(false);
    }
  }, [motDePasse, nomComplet, user]);

  return (
    <Screen style={{ gap: Spacing.three }}>
      <BackButton />
      <Section title="Paramètres" caption="Préférences" />

      <Section title="Sécurité" />
      <View
        style={[
          styles.row,
          Shadows.card,
          { backgroundColor: theme.surface, borderColor: theme.line },
        ]}
      >
        <Ionicons
          name="finger-print-outline"
          size={24}
          color={theme.primary}
          style={{ marginRight: Spacing.two }}
        />
        <View style={{ flex: 1, paddingRight: Spacing.two }}>
          <Text style={{ color: theme.text, fontWeight: "600" }}>Connexion biométrique</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {biometrieActive
              ? "Empreinte activée sur cet appareil"
              : "Se connecter avec l'empreinte de votre téléphone"}
          </Text>
        </View>
        <Switch
          value={biometrieActive}
          onValueChange={(value) => void basculerBiometrie(value)}
          disabled={chargementBiometrie || activationEnCours}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        Notifications push
      </Text>

      {loading && (
        <Text style={{ color: theme.textSecondary }}>Chargement des préférences…</Text>
      )}

      {!loading && preferences.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>
          Aucune préférence disponible.
        </Text>
      )}

      {preferences.map((p) => {
        const actif = modifiees[p.type] ?? p.pushActive;

        return (
          <View
            key={p.type}
            style={[
              styles.row,
              Shadows.card,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Text style={{ fontSize: 18, marginRight: Spacing.two }}>{p.emoji ?? "🔔"}</Text>
            <View style={{ flex: 1, paddingRight: Spacing.two }}>
              <Text style={{ color: theme.text, fontWeight: "600" }}>{p.libelle}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{p.type}</Text>
            </View>
            <Switch value={actif} onValueChange={(v) => basculer(p.type, v)} />
          </View>
        );
      })}

      <Button
        title="Enregistrer"
        icon="checkmark-circle-outline"
        loading={enregistrement}
        disabled={loading || preferences.length === 0}
        onPress={enregistrer}
      />

      <View style={styles.aide}>
        <Ionicons name="information-circle-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.aideTexte, { color: theme.textSecondary }]}>
          Coupez la push « Nouvelle offre de crédit disponible » pour ne plus être dérangé par les
          offres.
        </Text>
      </View>

      <Modal
        visible={modalBiometrie}
        transparent
        animationType="fade"
        onRequestClose={() => setModalBiometrie(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Activer la connexion biométrique
            </Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Confirmez vos identifiants. Ils seront enregistrés de façon sécurisée sur cet appareil.
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.line }]}
              placeholder="Nom complet"
              placeholderTextColor={theme.textSecondary}
              value={nomComplet}
              onChangeText={setNomComplet}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.line }]}
              placeholder="Mot de passe"
              placeholderTextColor={theme.textSecondary}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setModalBiometrie(false)}
                disabled={activationEnCours}
                style={[styles.modalButton, { backgroundColor: theme.primarySoft }]}
              >
                <Text style={{ color: theme.primary, fontWeight: "700" }}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={() => void activerBiometrie()}
                disabled={activationEnCours}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.onPrimary, fontWeight: "700" }}>
                  {activationEnCours ? "Patientez…" : "Activer"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  aide: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.one,
  },
  aideTexte: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.three,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
  modalButton: {
    minWidth: 100,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
  },
});
