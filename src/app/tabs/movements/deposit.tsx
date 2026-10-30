import React, { useState } from "react";

import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

      <Text style={[styles.label, { color: theme.textSecondary }]}>Type de versement</Text>
      <View style={[styles.types, { backgroundColor: theme.backgroundElement }]}>
        {TYPES.map((t) => {
          const active = type === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setType(t.key)}
              style={[
                styles.typeOption,
                active && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: active ? "#ffffff" : theme.textSecondary },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Montant (MGA)</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.line, backgroundColor: theme.surface, color: theme.text },
        ]}
        value={montant}
        onChangeText={setMontant}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Agence</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.line, backgroundColor: theme.surface, color: theme.text },
        ]}
        value={agence}
        onChangeText={setAgence}
        placeholder="Agence (optionnel)"
        placeholderTextColor={theme.textSecondary}
      />

      {selectedAccount && (
        <View style={[styles.infoRow, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Compte crédité</Text>
          <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>
            {selectedAccount.label}
          </Text>
        </View>
      )}

      <Button title="Demander le versement" loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  types: { flexDirection: "row", gap: Spacing.one, borderRadius: 16, padding: Spacing.one },
  typeOption: {
    flex: 1,
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: 12,
    alignItems: "center",
  },
  typeText: { fontSize: 13, fontWeight: "700" },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    fontSize: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  infoLabel: { fontSize: 12, fontWeight: "600" },
  infoValue: { flex: 1, fontSize: 13, fontWeight: "700", textAlign: "right" },
});