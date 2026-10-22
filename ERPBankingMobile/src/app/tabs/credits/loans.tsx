import React from "react";

import { Text } from "react-native";

import { router } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { fetchLoans } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Row } from "@/components/ui/row";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/utils/format";

export default function LoansScreen() {
  const theme = useTheme();
  const { data: loans, loading } = useAsyncData(fetchLoans, []);

  return (
    <Screen>
      <BackButton />
      <Section title="Mes crédits" />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {loans?.map((loan) => (
        <Card key={loan.id} padded>
          <Row
            title={`${formatMoney(loan.montant, loan.devise)} · ${loan.dureeMois} mois`}
            subtitle={`Restant : ${formatMoney(loan.resteDu, loan.devise)} · ${loan.mensualite.toLocaleString("fr-FR")}/mois`}
            onPress={() => router.push({ pathname: "/tabs/credits/loan/[id]", params: { id: loan.id } })}
            right={
              <Badge
                label={loan.statut === "en_cours" ? "En cours" : loan.statut}
                tone={loan.statut === "en_cours" ? "success" : "neutral"}
              />
            }
          />
        </Card>
      ))}

      {!loading && loans?.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun crédit en cours.</Text>
      )}
    </Screen>
  );
}