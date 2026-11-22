import React, { useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { IconButton } from "@/components/ui/icon-button";
import { Radius, Shadows, Spacing } from "@/constants/theme";
import { fetchAccountById, fetchAccountOperations } from "@/services/accountsService";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { CreditActionsModal } from "@/components/ui/credit-actions";
import { AccountStatsModal } from "@/components/ui/account-stats";
import { formatAr, formatDate, maskNumber } from "@/utils/format";

const BALANCE_GRADIENT = ["#0B2A5B", "#071A3A", "#061024"] as const;

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [creditActionsVisible, setCreditActionsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const { data: account } = useAsyncData(() => fetchAccountById(id!), [id]);
  const { data: operations } = useAsyncData(() => fetchAccountOperations(id!), [id]);

  if (!account) return null;

  const accountLabel =
    account.type === "epargne" ? "Compte épargne" : "Compte courant";

  const quickActions = [
    {
      label: "Virement",
      icon: "swap-horizontal",
      onPress: () =>
        router.push(`/tabs/movements/transfer/new?from=${account.id}`),
    },
    {
      label: "Historique",
      icon: "time-outline",
      onPress: () => router.push(`/tabs/movements/history?accountId=${account.id}`),
    },
    {
      label: "Crédit",
      icon: "pricetags",
      onPress: () => setCreditActionsVisible(true),
    },
    {
      label: "Statistiques",
      icon: "stats-chart",
      onPress: () => setStatsVisible(true),
    },
  ];

  return (
    <Screen>
      {/* Titre de l'écran */}
      <View style={styles.header}>
        <IconButton
          icon="chevron-back"
          onPress={() => router.back()}
          accessibilityLabel="Retour"
        />
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {accountLabel}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Carte compte */}
      <LinearGradient
        colors={BALANCE_GRADIENT}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accountCard}
      >
        <View style={styles.balanceSheen} />
        <View style={styles.accountCardTop}>
          <Text style={styles.accountCardType}>{accountLabel}</Text>
          <Ionicons name="card-outline" size={20} color="#ffffff" />
        </View>
        <Text style={styles.accountCardNumber}>{maskNumber(account.numero)}</Text>
        <View>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{formatAr(account.balance)}</Text>
        </View>
        <Text style={styles.accountCardDevise}>{account.currency}</Text>
      </LinearGradient>

      {/* Actions rapides */}
      <Section title="Actions rapides" caption="Sur ce compte" />
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              Shadows.card,
              pressed && styles.actionCardPressed,
            ]}
          >
            <View
              style={[
                styles.actionCard,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={20} color={theme.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Transactions du compte */}
      <Section
        title="Transactions récentes"
        caption="Historique"
        right={
          <Pressable
            onPress={() => router.push(`/tabs/movements/history?accountId=${account.id}`)}
            hitSlop={8}
          >
            <Text style={[styles.seeAll, { color: theme.primary }]}>Voir tout</Text>
          </Pressable>
        }
      />
      {operations?.map((op) => {
        const isIncoming =
          op.direction === "entrant" || op.type === "versement";
        return (
          <Row
            key={op.id}
            title={op.label}
            subtitle={`${formatDate(op.date)} · ${op.reference}`}
            right={
              <Badge
                tone={isIncoming ? "success" : "danger"}
                label={`${isIncoming ? "+" : "-"}${formatAr(op.amount)}`}
              />
            }
          />
        );
      })}
      {operations && operations.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucune transaction pour ce compte.</Text>
      )}

      <CreditActionsModal
        visible={creditActionsVisible}
        onClose={() => setCreditActionsVisible(false)}
        onNewRequest={() => router.push(`/tabs/credits/new?accountId=${account.id}`)}
        onViewRequests={() => router.push("/tabs/credits/requests")}
        onViewOffers={() => router.push("/tabs/credits/offers")}
        onReimburse={() => router.push("/tabs/credits/loans")}
      />

      <AccountStatsModal
        visible={statsVisible}
        onClose={() => setStatsVisible(false)}
        accountNumero={account.numero}
        operations={operations ?? []}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  accountCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: "hidden",
  },
  balanceSheen: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  accountCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountCardType: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  accountCardNumber: {
    color: "#E8F1FC",
    fontSize: 14,
    letterSpacing: 1,
  },
  balanceLabel: {
    color: "#E8F1FC",
    fontSize: 13,
    fontWeight: "600",
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: Spacing.half,
  },
  accountCardDevise: {
    color: "#E8F1FC",
    fontSize: 12,
    fontWeight: "600",
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  actionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
});