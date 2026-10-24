import React, { useCallback, useState } from "react";

import { Alert, StyleSheet, Switch, Text, View } from "react-native";
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

/**
 * Préférences de notification.
 *
 * Le backend expose le catalogue complet via GET /api/notifications/preferences
 * et respecte `pushActive` avant tout envoi FCM. On ne montre que les types
 * dont le roleCible est CLIENT, les autres ne concernant pas l'utilisateur mobile.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const { data, loading, reload } = useAsyncData<NotificationPreference[]>(
    fetchNotificationPreferences,
    []
  );
  const [modifiees, setModifiees] = useState<Record<string, boolean>>({});
  const [enregistrement, setEnregistrement] = useState(false);

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

  return (
    <Screen scroll={false} style={{ gap: Spacing.three }}>
      <BackButton />
      <Section title="Paramètres" caption="Préférences" />

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
});
