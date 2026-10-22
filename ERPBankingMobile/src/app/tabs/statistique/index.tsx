import React, { useMemo, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { fetchAccounts, fetchAllOperations } from "@/services/accountsService";
import { fetchDashboard } from "@/services/dashboardService";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { PieChart } from "@/components/ui/pie-chart";
import { formatAr, formatCompactAr, maskNumber } from "@/utils/format";
import {
  computeCategoryTotals,
  computeExpenseSeries,
  filterByAccount,
  Period,
} from "@/utils/statistics";

const BALANCE_GRADIENT = ["#0B2A5B", "#071A3A"] as const;
const PERIODS: { key: Period; label: string }[] = [
  { key: "7j", label: "7 jours" },
  { key: "mois", label: "Mois" },
  { key: "annee", label: "Année" },
];
const CHART_HEIGHT = 110;

export default function StatistiqueScreen() {
  const theme = useTheme();
  const dashboardQuery = useAsyncData(fetchDashboard, []);
  const accountsQuery = useAsyncData(fetchAccounts, []);
  const operationsQuery = useAsyncData(fetchAllOperations, []);

  const [period, setPeriod] = useState<Period>("7j");
  const [accountId, setAccountId] = useState<string | null>(null);

  const loading = dashboardQuery.loading || accountsQuery.loading || operationsQuery.loading;
  const error = dashboardQuery.error ?? accountsQuery.error ?? operationsQuery.error;

  const accounts = accountsQuery.data;
  const operations = operationsQuery.data;
  const dashboard = dashboardQuery.data;

  const allAccounts = useMemo(
    () => (accounts ?? []).filter((a) => a.balance != null),
    [accounts]
  );
  const selectedAccount = allAccounts.find((a) => a.id === accountId) ?? null;

  const filterChips = useMemo(
    () => [{ id: null, label: "Tous les comptes" }, ...allAccounts],
    [allAccounts]
  );

  const visibleOps = useMemo(
    () => filterByAccount(operations ?? [], accountId),
    [operations, accountId]
  );

  const series = useMemo(() => computeExpenseSeries(visibleOps, period), [visibleOps, period]);
  const categories = useMemo(
    () => computeCategoryTotals(visibleOps, period),
    [visibleOps, period]
  );
  const maxValue = Math.max(...series.map((p) => p.value), 0);
  const hasExpenses = maxValue > 0;

  const availableBalance = selectedAccount?.balance ?? dashboard?.soldeTotal ?? 0;

  if (error) {
    return (
      <Screen>
        <Section title="Statistiques" />
        <View style={[styles.chartCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.emptyText, { color: theme.danger }]}>{error}</Text>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <Section title="Statistiques" />
        <Text style={{ color: theme.textSecondary }}>Chargement des statistiques…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Section title="Statistiques" />

      {/* Solde disponible */}
      <LinearGradient
        colors={BALANCE_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>
          {selectedAccount ? "Solde du compte sélectionné" : "Solde disponible"}
        </Text>
        <Text style={styles.balanceAmount}>{formatAr(availableBalance)}</Text>
        <Text style={styles.balanceSub}>
          {selectedAccount
            ? `${selectedAccount.type === "epargne" ? "Compte épargne" : "Compte courant"} · ${maskNumber(selectedAccount.numero)}`
            : `${allAccounts.length} compte${allAccounts.length > 1 ? "s" : ""} · analyse globale`}
        </Text>
      </LinearGradient>

      {/* Filtre par compte */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {filterChips.map((chip) => {
          const active = (chip.id ?? null) === accountId;
          return (
            <Pressable
              key={chip.id ?? "all"}
              onPress={() => setAccountId(chip.id)}
              style={[
                styles.chip,
                { borderColor: theme.line, backgroundColor: theme.backgroundElement },
                active && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <Text style={[styles.chipText, { color: theme.text }, active && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sélecteur de période */}
      <View style={[styles.segment, { backgroundColor: theme.backgroundSelected }]}>
        {PERIODS.map((p) => {
          const active = period === p.key;
          return (
            <Pressable
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[
                styles.segmentItem,
                active && { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: theme.textSecondary },
                  active && { color: theme.text, fontWeight: "700" },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Graphique des dépenses */}
      <Section title="Dépenses" />
      <View style={[styles.chartCard, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.chartRow}>
          {series.map((p, i) => {
            const heightPct = p.value > 0 ? Math.max((p.value / maxValue) * 100, 4) : 0;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barValue, { color: theme.textSecondary }]} numberOfLines={1}>
                  {p.value > 0 ? formatCompactAr(p.value) : ""}
                </Text>
                <View
                  style={[styles.barTrack, { height: CHART_HEIGHT, backgroundColor: theme.background }]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: theme.primary,
                        height: `${heightPct}%`,
                        borderRadius: p.value > 0 ? 6 : 0,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{p.label}</Text>
              </View>
            );
          })}
        </View>
        {!hasExpenses && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucune dépense sur cette période.
          </Text>
        )}
      </View>

      {/* Répartition des dépenses */}
      <Section title="Répartition des dépenses" />
      <PieChart
        slices={categories}
        emptyLabel="Aucune dépense sur cette période."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  balanceLabel: {
    color: "#E8F1FC",
    fontSize: 14,
    fontWeight: "600",
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  balanceSub: {
    color: "#E8F1FC",
    fontSize: 12,
  },

  chipsRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },

  segment: {
    flexDirection: "row",
    borderRadius: 14,
    padding: Spacing.one,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },

  chartCard: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  barValue: {
    fontSize: 9,
    fontWeight: "600",
  },
  barTrack: {
    width: "100%",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
  },
});
