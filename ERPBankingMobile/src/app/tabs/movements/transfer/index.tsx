import React from "react";

import { Text, View } from "react-native";

import { router } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { fetchTransfers } from "@/services/transfersService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDateTime } from "@/utils/format";

const STATUS_MAP: Record<string, { label: string; tone: "success" | "warning" | "danger" | "primary" }> = {
  effectue: { label: "Effectué", tone: "success" },
  en_attente: { label: "En attente", tone: "warning" },
  en_cours: { label: "En cours", tone: "primary" },
  refuse: { label: "Refusé", tone: "danger" },
};

export default function TransfersScreen() {
  const theme = useTheme();
  const { data: transfers, loading } = useAsyncData(fetchTransfers, []);

  return (
    <Screen>
      <BackButton />

      <Section
        title="Mes virements"
        right={<Button title="+ Nouveau" onPress={() => router.push("/tabs/movements/transfer/new")} />}
      />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {transfers?.map((t) => {
        const status = STATUS_MAP[t.statut] ?? STATUS_MAP.en_attente;
        return (
          <Card key={t.id} padded>
            <Row
              title={t.destinataire}
              subtitle={`${formatDateTime(t.date)} · ${t.motif}`}
              right={
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>{formatMoney(t.montant, t.devise)}</Text>
                  <Badge label={status.label} tone={status.tone} />
                </View>
              }
            />
          </Card>
        );
      })}

      {!loading && transfers?.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun virement.</Text>
      )}
    </Screen>
  );
}