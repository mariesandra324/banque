import React, { useState } from "react";

import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { fetchAccounts } from "@/services/accountsService";
import { createDepositRequest } from "@/services/transfersService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { DepositType } from "@/constants/types";

const TYPES: { key: DepositType; label: string }[] = [
  { key: "especes", label: "Espèces" },
  { key: "cheque", label: "Chèque" },
  { key: "guichet", label: "Guichet" },
];

export default function DepositScreen() {
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const theme = useTheme();
  const { data: accounts } = useAsyncData(fetchAccounts, []);
  const [type, setType] = useState<DepositType>("especes");
  const [montant, setMontant] = useState("");
  const [agence, setAgence] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAccount =
    accounts?.find((a) => a.id === accountId) ?? accounts?.[0];

  const handleSubmit = async () => {
    const parsed = parseFloat(montant);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Erreur", "Montant invalide.");
      return;
    }
    setLoading(true);
    try {
      await createDepositRequest({
        type,
        montant: parsed,
        devise: selectedAccount?.currency ?? "MGA",
        compte: selectedAccount?.label ?? "",
        agence: agence.trim() || undefined,
      });
      Alert.alert("Succès", "Votre demande de versement a été enregistrée.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false} style={{ gap: Spacing.three }}>
      <BackButton />
      <Section title="Versement" />

      <Text style={styles.label}>Type de versement</Text>
      <View style={styles.types}>
        {TYPES.map((t) => (
          <Button
            key={t.key}
            title={t.label}
            variant={type === t.key ? "primary" : "secondary"}
            onPress={() => setType(t.key)}
          />
        ))}
      </View>

      <Text style={styles.label}>Montant (MGA)</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={montant} onChangeText={setMontant} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>Agence</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={agence} onChangeText={setAgence} placeholder="Agence (optionnel)" />

      {selectedAccount && (
        <Text style={{ color: theme.textSecondary }}>
          Compte crédité : {selectedAccount.label}
        </Text>
      )}

      <Button title="Demander le versement" loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  types: { flexDirection: "row", gap: Spacing.two },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 8 },
});