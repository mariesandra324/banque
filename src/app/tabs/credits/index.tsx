import React from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/use-theme";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";

const actions = [
  { label: "Nouvelle demande", subtitle: "Soumettre une demande de crédit", icon: "add-circle-outline" as const, href: "/tabs/credits/new" as const },
  { label: "Offres de crédit", subtitle: "Consultez les offres disponibles", icon: "pricetags-outline" as const, href: "/tabs/credits/offers" as const },
  { label: "Demandes de crédit", subtitle: "Suivez l'état de vos demandes", icon: "document-text-outline" as const, href: "/tabs/credits/requests" as const },
  { label: "Mes crédits", subtitle: "Crédits en cours et échéanciers", icon: "card-outline" as const, href: "/tabs/credits/loans" as const },
];

export default function CreditsHubScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <Section title="Crédits" caption="Financement" />
      {actions.map((action) => (
        <Row
          key={action.label}
          title={action.label}
          subtitle={action.subtitle}
          left={<Ionicons name={action.icon} size={22} color={theme.primary} />}
          right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
          onPress={() => router.push(action.href)}
        />
      ))}
    </Screen>
  );
}