import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { usePinGate } from "@/hooks/use-pin-gate";
import { PinModal } from "@/components/ui/pin-modal";
import { fetchAccounts, verifyPin } from "@/services/accountsService";
import { Account } from "@/constants/types";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { Spacing } from "@/constants/theme";
import { formatMoney } from "@/utils/format";

export default function AccountsScreen() {
  const theme = useTheme();
  const { data: accounts, loading } = useAsyncData(fetchAccounts, []);
  const { visible: pinVisible, requestPin, handleConfirm, handleCancel } = usePinGate();

  const openAccount = (account: Account) => {
    requestPin(
      async (pin) => {
        await verifyPin(Number(account.id), pin);
      },
      () =>
        router.push({ pathname: "/tabs/accounts/[id]", params: { id: account.id } })
    );
  };

  return (
    <Screen>
      <Section title="Mes comptes" caption="Votre patrimoine" />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {accounts?.map((account) => {
        const isEpargne = account.type === "epargne";
        return (
          <Row
            key={account.id}
            title={account.label}
            subtitle={`${isEpargne ? "Épargne" : "Disponible"} · ${maskIban(account.iban)}`}
            onPress={() => openAccount(account)}
            left={
              <Ionicons
                name={isEpargne ? "leaf-outline" : "wallet-outline"}
                size={20}
                color={theme.primary}
              />
            }
            right={
              <View style={styles.balanceBlock}>
                <Text style={[styles.balance, { color: theme.text }]}>
                  {formatMoney(account.balance, account.currency)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </View>
            }
          />
        );
      })}

      {!loading && accounts?.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun compte trouvé.</Text>
      )}

      <PinModal
        visible={pinVisible}
        title="Accès au compte"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Screen>
  );
}

function maskIban(iban?: string): string {
  if (!iban) return "";
  const clean = iban.replace(/\s/g, "");
  return `${clean.slice(0, 4)} •••• ${clean.slice(-4)}`;
}

const styles = StyleSheet.create({
  balanceBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  balance: {
    fontSize: 15,
    fontWeight: "800",
  },
});