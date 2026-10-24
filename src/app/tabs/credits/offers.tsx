import React from "react";

import { Text } from "react-native";

import { router } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { fetchCreditOffers } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Row } from "@/components/ui/row";
import { formatMoney } from "@/utils/format";

export default function CreditOffersScreen() {
  const theme = useTheme();
  const { data: offers, loading } = useAsyncData(fetchCreditOffers, []);

  return (
    <Screen>
      <BackButton />
      <Section title="Offres de crédit" />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {offers?.map((offer) => (
        <Card key={offer.id} padded>
          <Row
            title={offer.titre}
            subtitle={`Jusqu'à ${formatMoney(offer.montantMax, offer.devise)} · ${offer.tauxAnnuel}% / ${offer.dureeMaxMois} mois`}
            onPress={() => router.push({ pathname: "/tabs/credits/offer/[id]", params: { id: offer.id } })}
          />
        </Card>
      ))}

      {!loading && offers?.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucune offre disponible.</Text>
      )}
    </Screen>
  );
}