import React, { useState } from "react";

import { Alert, StyleSheet, Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { fetchLoanById, reimburseEcheance } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/utils/format";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: loan, reload } = useAsyncData(() => fetchLoanById(id!), [id]);
  const [loadingReimburse, setLoadingReimburse] = useState(false);

  if (!loan) return null;

  const nextEcheance = loan.echeances.find((e) => !e.payee);

  const handleReimburse = async () => {
    if (!nextEcheance?.id) {
      Alert.alert("Remboursement", "Cette échéance ne peut pas être remboursée ici.");
      return;
    }
    try {
      setLoadingReimburse(true);
      await reimburseEcheance(loan.id, nextEcheance.id);
      Alert.alert("Remboursement effectué", "L'échéance a bien été remboursée.");
      reload();
    } catch (err) {
      Alert.alert(
        "Remboursement impossible",
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoadingReimburse(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <Section title={`Crédit ${loan.reference}`} />

      {/* Summary card */}
      <Card padded style={{ gap: Spacing.two }}>
        <DetailRow label="Montant total" value={formatMoney(loan.montant, loan.devise)} theme={theme} />
        <DetailRow label="Taux annuel" value={`${loan.tauxAnnuel}%`} theme={theme} />
        <DetailRow label="Durée" value={`${loan.dureeMois} mois`} theme={theme} />
        <DetailRow label="Mensualité" value={formatMoney(loan.mensualite, loan.devise)} theme={theme} />
        <DetailRow label="Restant dû" value={formatMoney(loan.resteDu, loan.devise)} theme={theme} />
        {loan.prochaineEcheance && (
          <DetailRow label="Prochaine échéance" value={formatDate(loan.prochaineEcheance)} theme={theme} />
        )}
      </Card>

      {/* Remboursement */}
      {nextEcheance && (
        <Card padded style={{ gap: Spacing.two }}>
          <View style={styles.reimburseRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                Échéance attendue · #{nextEcheance.numero}
              </Text>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>
                {formatMoney(nextEcheance.total, loan.devise)}
              </Text>
            </View>
            <Button
              title="Rembourser"
              loading={loadingReimburse}
              onPress={handleReimburse}
              style={styles.reimburseBtn}
            />
          </View>
        </Card>
      )}

      {/* Echéancier */}
      <Section title="Échéancier" />
      {loan.echeances.map((e) => (
        <Row
          key={e.numero}
          title={`#${e.numero} · ${formatDate(e.date)}`}
          subtitle={`Capital : ${formatMoney(e.capital, loan.devise)} · Intérêts : ${formatMoney(e.interets, loan.devise)}`}
          right={
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Badge label={e.payee ? "Payé" : "À payer"} tone={e.payee ? "success" : "warning"} />
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}>
                {formatMoney(e.total, loan.devise)}
              </Text>
            </View>
          }
        />
      ))}
    </Screen>
  );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.line }]}>
      <Text style={{ color: theme.textSecondary }}>{label}</Text>
      <Text style={{ color: theme.text, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reimburseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  reimburseBtn: {
    minWidth: 140,
  },
});