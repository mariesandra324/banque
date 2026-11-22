import React from "react";

import { Alert, StyleSheet, Text, View } from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { fetchCreditOfferById, acceptCreditOffer, refuseCreditOffer } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { formatMoney, formatDate } from "@/utils/format";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: offer } = useAsyncData(() => fetchCreditOfferById(id!), [id]);

  if (!offer) return null;

  const statut = (offer.statut ?? "").toUpperCase();
  const isAccepted = statut === "ACCEPTEE";
  const isRefused = statut === "REFUSEE";
  const isPending = statut === "EN_ATTENTE" || !statut;

  const handleAccept = async () => {
    if (!isPending) return;
    try {
      await acceptCreditOffer(offer.id);
      Alert.alert("Offre acceptée", "Votre demande de crédit a été soumise.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erreur", "Impossible d'accepter cette offre.");
    }
  };

  const handleRefuse = async () => {
    if (!isPending) return;
    try {
      await refuseCreditOffer(offer.id);
      Alert.alert("Offre refusée", "Cette offre a été refusée.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erreur", "Impossible de refuser cette offre.");
    }
  };

  return (
    <Screen>
      <BackButton />
      <Section title={offer.titre} />

      {offer.statut && (
        <Text
          style={[
            styles.statut,
            { color: isAccepted ? theme.success : isRefused ? theme.danger : theme.primary },
          ]}
        >
          {isAccepted ? "● Offre acceptée" : isRefused ? "● Offre refusée" : "● Offre en attente"}
        </Text>
      )}

      <Card padded>
        <Text style={[styles.description, { color: theme.text }]}>{offer.description}</Text>
      </Card>

      <Card padded style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={{ color: theme.textSecondary }}>Montant proposé</Text>
          <Text style={[styles.amount, { color: theme.text }]}>{formatMoney(offer.montantMax, offer.devise)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={{ color: theme.textSecondary }}>Taux annuel</Text>
          <Text style={[styles.amount, { color: theme.text }]}>{offer.tauxAnnuel}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={{ color: theme.textSecondary }}>Durée</Text>
          <Text style={[styles.amount, { color: theme.text }]}>{offer.dureeMaxMois} mois</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={{ color: theme.textSecondary }}>Mensualité estimée</Text>
          <Text style={[styles.amount, { color: theme.text }]}>{formatMoney(offer.mensualite, offer.devise)}</Text>
        </View>
        {offer.dateExpiration && (
          <View style={styles.detailRow}>
            <Text style={{ color: theme.textSecondary }}>Date {"d'"}expiration</Text>
            <Text style={[styles.amount, { color: theme.text }]}>{formatDate(offer.dateExpiration)}</Text>
          </View>
        )}
      </Card>

      {isPending ? (
        <View style={styles.actions}>
          <Button title="Accepter l'offre" onPress={handleAccept} />
          <Button title="Refuser" variant="danger" onPress={handleRefuse} />
        </View>
      ) : (
        <View style={[styles.actions, { backgroundColor: theme.backgroundElement, borderRadius: 14, padding: Spacing.three }]}>
          <Text style={[styles.closedText, { color: theme.textSecondary }]}>
            Les actions ne sont plus disponibles pour cette offre.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: { lineHeight: 22 },
  statut: { fontSize: 14, fontWeight: "600" },
  details: { gap: Spacing.two },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontWeight: "700" },
  actions: { gap: Spacing.two },
  closedText: { fontSize: 14, textAlign: "center" },
});