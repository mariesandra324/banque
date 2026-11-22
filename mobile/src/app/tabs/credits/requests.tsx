import React from "react";

import { StyleSheet, Text, View } from "react-native";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { fetchCreditRequests } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/utils/format";
import { router } from "expo-router";

const STATUS_MAP: Record<string, { label: string; tone: "success" | "warning" | "danger" | "primary" }> = {
  en_attente: { label: "En attente", tone: "warning" },
  en_cours: { label: "En cours", tone: "primary" },
  accepte: { label: "Acceptée", tone: "success" },
  refuse: { label: "Refusée", tone: "danger" },
  rembourse: { label: "Remboursé", tone: "success" },
};

export default function CreditRequestsScreen() {
  const theme = useTheme();
  const { data: requests, loading } = useAsyncData(fetchCreditRequests, []);

  return (
    <Screen>
      <View style={styles.topBar}>
        <BackButton />
        <Button title="+ Nouvelle demande" variant="secondary" onPress={() => router.push("/tabs/credits/new")} />
      </View>
      <Section title="Demandes de crédit" />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {requests?.map((req) => {
        const status = STATUS_MAP[req.statut] ?? STATUS_MAP.en_attente;
        return (
          <Row
            key={req.id}
            title={`${formatMoney(req.montant, req.devise)} · ${req.dureeMois} mois`}
            subtitle={`${req.motif} · ${formatDate(req.date)}`}
            right={<Badge label={status.label} tone={status.tone} />}
          />
        );
      })}

      {!loading && requests?.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucune demande.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});