import { useMemo, useState } from "react";

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { KpiTile } from "@/components/ui/kpi-tile";
import { PieChart } from "@/components/ui/pie-chart";
import { formatAr, formatCompactAr, maskNumber } from "@/utils/format";
import {
  computeCategoryTotals,
  computeExpenseSeries,
  Period,
} from "@/utils/statistics";
import { Operation } from "@/constants/types";

const PERIODS: { key: Period; label: string }[] = [
  { key: "7j", label: "7 jours" },
  { key: "mois", label: "Mois" },
  { key: "annee", label: "Année" },
];
const BAR_HEIGHT = 72;

interface AccountStatsModalProps {
  visible: boolean;
  onClose: () => void;
  accountNumero: string;
  operations: Operation[];
}

/** Histogramme compact des dépenses sur la période choisie. */
function ExpenseBars({ operations, period }: { operations: Operation[]; period: Period }) {
  const theme = useTheme();
  const series = useMemo(() => computeExpenseSeries(operations, period), [operations, period]);
  const max = Math.max(...series.map((p) => p.value), 0);
  if (max <= 0) return null;

  return (
    <View style={styles.bars}>
      {series.map((point, index) => (
        <View key={`${point.label}-${index}`} style={styles.barCol}>
          <View style={[styles.barTrack, { height: BAR_HEIGHT, backgroundColor: theme.background }]}>
            <View
              style={[
                styles.barFill,
                {
                  backgroundColor: theme.primary,
                  height: `${Math.max((point.value / max) * 100, 3)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>
            {point.label}
          </Text>
          <Text style={[styles.barValue, { color: theme.textSecondary }]} numberOfLines={1}>
            {point.value > 0 ? formatCompactAr(point.value) : "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Feuille « Statistiques » : indicateurs, répartition circulaire et histogramme. */
export function AccountStatsModal({
  visible,
  onClose,
  accountNumero,
  operations,
}: AccountStatsModalProps) {
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>("mois");

  const expenses = useMemo(
    () => operations.filter((o) => o.direction === "sortant"),
    [operations]
  );
  const income = useMemo(
    () => operations.filter((o) => o.direction === "entrant"),
    [operations]
  );
  const categories = useMemo(
    () => computeCategoryTotals(operations, period),
    [operations, period]
  );

  const totalSpent = expenses.reduce((sum, o) => sum + o.amount, 0);
  const totalIncome = income.reduce((sum, o) => sum + o.amount, 0);
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={() => {}}
        >
          <View style={[styles.grabber, { backgroundColor: theme.line }]} />
          <Text style={[styles.title, { color: theme.text }]}>Statistiques du compte</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {maskNumber(accountNumero)}
          </Text>

          <View style={[styles.segment, { backgroundColor: theme.backgroundElement }]}>
            {PERIODS.map((item) => {
              const active = item.key === period;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setPeriod(item.key)}
                  style={[
                    styles.segmentItem,
                    active && Shadows.card,
                    active && { backgroundColor: theme.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: theme.textSecondary },
                      active && { color: theme.primary, fontWeight: "700" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.kpiRow}>
              <KpiTile label="Dépenses" value={formatAr(totalSpent)} tone="danger" />
              <KpiTile label="Recettes" value={formatAr(totalIncome)} tone="success" />
              <KpiTile
                label="Opérations"
                value={`${operations.length}`}
                tone={operations.length > 0 ? "primary" : "neutral"}
              />
            </View>

            <Text style={[styles.blockTitle, { color: theme.text }]}>
              Répartition des dépenses · {periodLabel}
            </Text>
            <PieChart
              slices={categories}
              emptyLabel="Aucune dépense sur cette période."
            />

            <Text style={[styles.blockTitle, { color: theme.text }]}>
              Dépenses par jour · {periodLabel}
            </Text>
            <ExpenseBars operations={operations} period={period} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
    maxHeight: "88%",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: -Spacing.one,
  },
  segment: {
    flexDirection: "row",
    borderRadius: 14,
    padding: Spacing.one,
    marginTop: Spacing.two,
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
  scroll: {
    marginTop: Spacing.two,
  },
  scrollBody: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  kpiRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.one,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  barTrack: {
    width: "100%",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  barValue: {
    fontSize: 8,
  },
});
