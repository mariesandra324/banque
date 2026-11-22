import React from "react";

import { Text, View } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { fetchAccountOperations, fetchAllOperations } from "@/services/accountsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDateTime } from "@/utils/format";

const TYPE_LABEL: Record<string, string> = {
  virement: "Virement",
  versement: "Versement",
  paiement: "Paiement",
  retrait: "Retrait",
};

export default function HistoryScreen() {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const theme = useTheme();
  const { data: operations, loading } = useAsyncData(
    accountId ? () => fetchAccountOperations(accountId) : fetchAllOperations,
    [accountId]
  );

  const visibleOps = operations ?? [];

  return (
    <Screen>
      <BackButton />
      <Section title={accountId ? "Historique du compte" : "Historique des opérations"} />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {visibleOps.map((op) => (
        <Row
          key={op.id}
          title={op.label}
          subtitle={`${TYPE_LABEL[op.type] ?? op.type} · ${formatDateTime(op.date)} · ${op.reference}`}
          right={
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={{ color: op.direction === "entrant" ? theme.success : theme.danger, fontWeight: "700" }}>
                {op.direction === "entrant" ? "+" : "-"}{formatMoney(op.amount, op.currency)}
              </Text>
              <Badge
                label={op.status === "effectue" ? "Réalisé" : "En attente"}
                tone={op.status === "effectue" ? "success" : "warning"}
              />
            </View>
          }
        />
      ))}

      {!loading && visibleOps.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucune opération.</Text>
      )}
    </Screen>
  );
}