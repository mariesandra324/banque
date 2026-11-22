import React from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/use-theme";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";

const actions = [
  { label: "Virements", subtitle: "Consulter et effectuer des virements", icon: "swap-horizontal-outline" as const, href: "/tabs/movements/transfer/index" as const },
  { label: "Versements", subtitle: "Effectuer ou demander un versement", icon: "cash-outline" as const, href: "/tabs/movements/deposit" as const },
  { label: "Historique", subtitle: "Toutes vos opérations", icon: "time-outline" as const, href: "/tabs/movements/history" as const },
];

export default function MovementsScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <Section title="Opérations" />
      {actions.map((action) => (
        <Row
          key={action.label}
          title={action.label}
          subtitle={action.subtitle}
          left={<Ionicons name={action.icon} size={24} color={theme.primary} />}
          onPress={() => router.push(action.href)}
        />
      ))}
    </Screen>
  );
}