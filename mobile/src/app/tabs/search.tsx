import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { fetchAccounts, fetchAllOperations } from "@/services/accountsService";
import { fetchBeneficiaries } from "@/services/transfersService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Section } from "@/components/ui/section";
import { formatMoney, maskNumber } from "@/utils/format";

type ResultGroup =
  | { kind: "account"; id: string; title: string; subtitle: string }
  | { kind: "transaction"; id: string; title: string; subtitle: string; amount?: string }
  | { kind: "beneficiary"; id: string; title: string; subtitle: string };

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState("");

  const { data: accounts } = useAsyncData(fetchAccounts, []);
  const { data: operations } = useAsyncData(fetchAllOperations, []);
  const { data: beneficiaries } = useAsyncData(fetchBeneficiaries, []);

  const q = query.trim().toLowerCase();

  const results = useMemo<ResultGroup[]>(() => {
    if (!q) return [];

    const filtered: ResultGroup[] = [];

    (accounts ?? [])
      .filter((a) =>
        [a.label, a.iban, a.numero].some((v) => v.toLowerCase().includes(q))
      )
      .forEach((a) =>
        filtered.push({
          kind: "account",
          id: a.id,
          title: a.label,
          subtitle: maskNumber(a.iban),
        })
      );

    (operations ?? [])
      .filter((o) =>
        [o.label, o.reference, String(o.amount)].some((v) =>
          v.toLowerCase().includes(q)
        )
      )
      .forEach((o) =>
        filtered.push({
          kind: "transaction",
          id: o.id,
          title: o.label,
          subtitle: `${o.reference} · ${o.date}`,
          amount: `${o.direction === "entrant" ? "+" : "-"}${formatMoney(o.amount)}`,
        })
      );

    (beneficiaries ?? [])
      .filter((b) => [b.nom, b.iban].some((v) => v.toLowerCase().includes(q)))
      .forEach((b) =>
        filtered.push({
          kind: "beneficiary",
          id: b.id,
          title: b.nom,
          subtitle: maskNumber(b.iban),
        })
      );

    return filtered;
  }, [q, accounts, operations, beneficiaries]);

  const onPressResult = (r: ResultGroup) => {
    if (r.kind === "account") {
      router.push({ pathname: "/tabs/accounts/[id]", params: { id: r.id } });
    } else if (r.kind === "beneficiary") {
      const b = (beneficiaries ?? []).find((x) => x.id === r.id);
      if (b) {
        router.push(
          `/tabs/movements/transfer/new?nom=${encodeURIComponent(b.nom)}&iban=${encodeURIComponent(b.iban)}`
        );
      }
    } else {
      router.push("/tabs/movements/history");
    }
  };

  return (
    <Screen scroll={false} style={{ gap: Spacing.three }}>
      <BackButton />
      <Section title="Recherche" />

      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Ionicons name="search-outline" size={20} color={theme.primary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Transaction, bénéficiaire, compte…"
          placeholderTextColor={theme.textSecondary}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {!q && (
        <Text style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.five }}>
          Recherchez une transaction, un bénéficiaire ou un compte.
        </Text>
      )}

      {q && results.length === 0 && (
        <Text style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.five }}>
          Aucun résultat pour « {query.trim()} ».
        </Text>
      )}

      <View style={{ gap: Spacing.two }}>
        {results.map((r) => (
          <Pressable
            key={`${r.kind}-${r.id}`}
            onPress={() => onPressResult(r)}
            style={[styles.result, { backgroundColor: theme.surface, borderColor: theme.line }]}
          >
            <View style={[styles.resultIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons
                name={r.kind === "account" ? "wallet-outline" : r.kind === "beneficiary" ? "people-outline" : "swap-horizontal-outline"}
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.resultBody}>
              <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>
                {r.title}
              </Text>
              <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                {r.subtitle}
              </Text>
            </View>
            {r.kind === "transaction" && r.amount ? (
              <Text style={[styles.resultAmount, { color: theme.text }]}>{r.amount}</Text>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            )}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two + Spacing.half,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBody: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  resultSubtitle: {
    fontSize: 12,
  },
  resultAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
});