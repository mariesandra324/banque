import React, { useCallback } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { usePinGate } from "@/hooks/use-pin-gate";
import { PinModal } from "@/components/ui/pin-modal";
import { Spacing, Shadows, Radius } from "@/constants/theme";
import { fetchAccounts, verifyPin } from "@/services/accountsService";
import { CarteInfo, fetchCardsForAccounts } from "@/services/cartesService";
import { Account } from "@/constants/types";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";

const GRADIENTS: readonly (readonly [string, string])[] = [
  ["#1557A6", "#0B2A5B"],
  ["#0B2A5B", "#071A3A"],
  ["#2F80ED", "#1557A6"],
];

function groupDigits(value: string, size = 4): string {
  const clean = value.replace(/\D/g, "");
  return clean.replace(new RegExp(`(.{${size}})`, "g"), "$1 ").trim();
}

function formatExpiry(iso: string): string {
  const [y, m] = iso.split("-");
  return m ? `${m}/${y?.slice(2)}` : iso;
}

export default function CartesScreen() {
  const theme = useTheme();
  const { visible: pinVisible, requestPin, handleConfirm, handleCancel } = usePinGate();
  const { data, loading, reload } = useAsyncData(async () => {
    const accounts = await fetchAccounts();
    const cards = await fetchCardsForAccounts(accounts);
    return { accounts, cards };
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const accounts = data?.accounts ?? [];
  const cards = data?.cards ?? new Map<string, CarteInfo>();

  const openAccount = (account: Account) => {
    requestPin(
      async (pin) => {
        await verifyPin(Number(account.id), pin);
      },
      () => router.push({ pathname: "/tabs/accounts/[id]", params: { id: account.id } })
    );
  };

  return (
    <Screen>
      <Section title="Mes cartes" caption="Portefeuille" />

      {loading && accounts.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Chargement…</Text>
      )}

      {accounts.map((account, index) => {
        const carte = cards.get(account.id);
        const colors = GRADIENTS[index % GRADIENTS.length];
        return (
          <Pressable
            key={account.id}
            onPress={() => openAccount(account)}
            style={({ pressed }) => [
              styles.pressScale,
              Shadows.floating,
              pressed && styles.cardPressed,
            ]}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardLabel}>{account.label}</Text>
                <Ionicons name="wifi-outline" size={22} color="#E8F1FC" />
              </View>

              <View style={styles.chip}>
                <Text style={styles.chipText}>ERP</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Numéro de compte</Text>
                <Text style={styles.fieldValue}>{groupDigits(account.numero)}</Text>
              </View>

              {carte ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Carte associée</Text>
                  <Text style={styles.fieldValue}>{groupDigits(carte.numeroCarte)}</Text>
                </View>
              ) : (
                <Text style={styles.noCard}>Aucune carte associée</Text>
              )}

              <View style={styles.cardBottom}>
                <Text style={styles.cardHolder}>{account.holder}</Text>
                {carte?.dateExpiration && (
                  <Text style={styles.cardExpiry}>Exp. {formatExpiry(carte.dateExpiration)}</Text>
                )}
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}

      {!loading && accounts.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun compte trouvé.</Text>
      )}

      <PinModal
        visible={pinVisible}
        title="Accès au compte"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressScale: {
    marginBottom: Spacing.three,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    aspectRatio: 1.58,
    justifyContent: "space-between",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: { color: "#E8F1FC", fontSize: 14, fontWeight: "600" },
  chip: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignSelf: "flex-start",
  },
  chipText: { color: "#ffffff", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  field: {
    gap: 2,
  },
  fieldLabel: {
    color: "#E8F1FC",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  noCard: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontStyle: "italic",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardHolder: {
    color: "#E8F1FC",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardExpiry: {
    color: "#E8F1FC",
    fontSize: 13,
    fontWeight: "600",
  },
});