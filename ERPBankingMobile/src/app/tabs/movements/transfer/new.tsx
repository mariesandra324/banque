import React, { useState } from "react";

import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { DEMO_PIN } from "@/constants/config";
import { fetchAccounts } from "@/services/accountsService";
import { createTransfer } from "@/services/transfersService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { PinModal } from "@/components/ui/pin-modal";
import { formatMoney } from "@/utils/format";

export default function NewTransferScreen() {
  const { from, nom, iban } = useLocalSearchParams<{ from?: string; nom?: string; iban?: string }>();
  const theme = useTheme();
  const { data: accounts } = useAsyncData(fetchAccounts, []);

  const [destinataire, setDestinataire] = useState(typeof nom === "string" ? nom : "");
  const [ibanDest, setIbanDest] = useState(typeof iban === "string" ? iban : "");
  const [sourceId, setSourceId] = useState<string | undefined>(from ? String(from) : undefined);
  const [montant, setMontant] = useState("");
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);

  const selectedAccount =
    accounts?.find((a) => a.id === sourceId) ?? accounts?.[0];

  const selectSource = (id: string) => {
    setSourceId(id);
  };

  const handleSubmit = () => {
    if (!destinataire.trim() || !ibanDest.trim() || !montant.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const parsed = parseFloat(montant);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Erreur", "Montant invalide.");
      return;
    }

    setPinVisible(true);
  };

  const confirmTransfer = async (pin: string) => {
    if (pin !== DEMO_PIN) {
      throw new Error("Code PIN incorrect.");
    }
    const parsed = parseFloat(montant);
    setLoading(true);
    try {
      await createTransfer({
        expediteur: selectedAccount?.label ?? "Compte courant",
        destinataire: destinataire.trim(),
        ibanDestinataire: ibanDest.trim(),
        montant: parsed,
        devise: selectedAccount?.currency ?? "MGA",
        motif: motif.trim(),
      });
      setPinVisible(false);
      Alert.alert("Succès", "Votre virement a été enregistré.", [
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
      <Section title="Nouveau virement" />

      <View>
        <Text style={styles.label}>Compte source</Text>
        <View style={styles.sourceWrap}>
          {(accounts ?? []).map((a) => {
            const active = a.id === selectedAccount?.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => selectSource(a.id)}
                style={[
                  styles.sourceChip,
                  { borderColor: active ? theme.primary : theme.line },
                  active && { backgroundColor: theme.primarySoft },
                ]}
              >
                <Text
                  style={[
                    styles.sourceChipLabel,
                    { color: active ? theme.primary : theme.text },
                  ]}
                >
                  {a.label}
                </Text>
                <Text
                  style={[
                    styles.sourceChipBalance,
                    { color: active ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {formatMoney(a.balance, a.currency)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedAccount && (
        <View style={[styles.accountInfo, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="wallet-outline" size={18} color={theme.primary} />
          <Text style={{ color: theme.primary, fontWeight: "600" }}>
            Depuis : {selectedAccount.label}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Nom du destinataire *</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={destinataire} onChangeText={setDestinataire} placeholder="Nom complet" />

      <Text style={styles.label}>IBAN du destinataire *</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={ibanDest} onChangeText={setIbanDest} placeholder="MG46 ..." autoCapitalize="none" />

      <Text style={styles.label}>Montant (MGA) *</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={montant} onChangeText={setMontant} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>Motif</Text>
      <TextInput style={[styles.input, { borderColor: theme.line }]} value={motif} onChangeText={setMotif} placeholder="Motif du virement" />

      <Button title="Effectuer le virement" loading={loading} onPress={handleSubmit} />

      <PinModal
        visible={pinVisible}
        title={`Virement de ${formatMoney(parseFloat(montant) || 0, selectedAccount?.currency ?? "MGA")}`}
        onCancel={() => setPinVisible(false)}
        onConfirm={confirmTransfer}
      >
        <View style={[styles.pinInfo, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.pinInfoRow}>
            <Text style={[styles.pinInfoLabel, { color: theme.textSecondary }]}>Depuis</Text>
            <Text style={[styles.pinInfoValue, { color: theme.text }]}>
              {selectedAccount?.label} · {formatMoney(selectedAccount?.balance ?? 0, selectedAccount?.currency)}
            </Text>
          </View>
          <View style={styles.pinInfoRow}>
            <Text style={[styles.pinInfoLabel, { color: theme.textSecondary }]}>Vers</Text>
            <Text style={[styles.pinInfoValue, { color: theme.text }]} numberOfLines={1}>
              {destinataire} · {ibanDest}
            </Text>
          </View>
        </View>
      </PinModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  accountInfo: {
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 8 },
  sourceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  sourceChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  sourceChipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  sourceChipBalance: {
    fontSize: 12,
  },
  pinInfo: {
    alignSelf: "stretch",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  pinInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  pinInfoLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  pinInfoValue: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
});