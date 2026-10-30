import React, { useCallback } from "react";

import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { usePinGate } from "@/hooks/use-pin-gate";
import { PinModal } from "@/components/ui/pin-modal";
import { Gradients, Spacing, Shadows, Radius } from "@/constants/theme";
import { fetchAccounts, verifyPin } from "@/services/accountsService";
import { CarteInfo, fetchCardsForAccounts } from "@/services/cartesService";
import { Account } from "@/constants/types";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";

const GRADIENTS = Gradients.cards;

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
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 1024;
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
            onPress={() => {
              if (carte?.pinResetPending) {
                router.push({
                  pathname: "/tabs/cartes/reinitialiser-pin",
                  params: { carteId: String(carte.id) },
                });
                return;
              }
              openAccount(account);
            }}
            style={({ pressed }) => [
              styles.pressScale,
              Shadows.floating,
              isWideWeb && styles.pressScaleWide,
              pressed && styles.cardPressed,
            ]}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardGlow} pointerEvents="none" />
              <View style={styles.cardGlowSoft} pointerEvents="none" />

              <View style={styles.cardTop}>
                <View style={styles.cardTopText}>
                  <Text style={styles.cardLabel}>
                    {account.type === "epargne" ? "Compte épargne" : "Compte courant"}
                  </Text>
                  <Text style={styles.cardNumber} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {groupDigits(account.numero)}
                  </Text>
                </View>
                <Ionicons name="wifi" size={20} color="#E8F1FC" style={styles.contactless} />
              </View>

              <View style={styles.cardMiddle}>
                <LinearGradient
                  colors={["#F7DE9B", "#D8AD4A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chip}
                >
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </LinearGradient>
                <Text style={styles.cardSecondary} numberOfLines={1}>
                  {carte?.pinResetPending
                    ? "Code reçu par e-mail — appuyez pour choisir un nouveau PIN"
                    : carte ? `Carte ${groupDigits(carte.numeroCarte)}` : "Aucune carte associée"}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.cardBottomBlock}>
                  <Text style={styles.fieldLabel}>Titulaire</Text>
                  <Text style={styles.cardHolder} numberOfLines={1}>
                    {account.holder}
                  </Text>
                </View>
                <View style={[styles.cardBottomBlock, styles.cardBottomRight]}>
                  <Text style={styles.fieldLabel}>Expiration</Text>
                  <Text style={styles.cardExpiry}>
                    {carte?.dateExpiration ? formatExpiry(carte.dateExpiration) : "—"}
                  </Text>
                </View>
                <Text style={styles.cardBrand}>ERP</Text>
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
  pressScaleWide: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.three + Spacing.one,
    aspectRatio: 1.58,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  cardGlowSoft: {
    position: "absolute",
    bottom: -90,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(98,166,255,0.18)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTopText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    color: "rgba(232,241,252,0.8)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardNumber: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  contactless: {
    transform: [{ rotate: "90deg" }],
  },
  cardMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  chip: {
    width: 42,
    height: 30,
    borderRadius: 7,
    paddingHorizontal: 5,
    justifyContent: "center",
    gap: 3,
  },
  chipLine: {
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(105,75,15,0.55)",
  },
  cardSecondary: {
    flex: 1,
    color: "rgba(232,241,252,0.85)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.three,
  },
  cardBottomBlock: {
    gap: 2,
  },
  cardBottomRight: {
    alignItems: "flex-end",
  },
  fieldLabel: {
    color: "rgba(232,241,252,0.7)",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardHolder: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    maxWidth: 150,
  },
  cardExpiry: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  cardBrand: {
    marginLeft: "auto",
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
  },
});