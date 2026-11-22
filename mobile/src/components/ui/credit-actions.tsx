import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface CreditActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onNewRequest: () => void;
  onViewRequests: () => void;
  onViewOffers: () => void;
  onReimburse: () => void;
}

export function CreditActionsModal({
  visible,
  onClose,
  onNewRequest,
  onViewRequests,
  onViewOffers,
  onReimburse,
}: CreditActionsModalProps) {
  const theme = useTheme();

  const items = [
    {
      label: "Nouvelle demande",
      subtitle: "Ajouter une demande de crédit",
      icon: "add-circle-outline",
      onPress: onNewRequest,
    },
    {
      label: "Vérifier mes demandes",
      subtitle: "État et suivi des demandes",
      icon: "document-text-outline",
      onPress: onViewRequests,
    },
    {
      label: "Voir / accepter / refuser une offre",
      subtitle: "Traiter les offres reçues",
      icon: "pricetags-outline",
      onPress: onViewOffers,
    },
    {
      label: "Remboursement",
      subtitle: "Rembourser une échéance",
      icon: "card-outline",
      onPress: onReimburse,
    },
  ];

  const run = (fn: () => void) => {
    onClose();
    setTimeout(fn, 150);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.background }]} onPress={() => {}}>
          <View style={[styles.grabber, { backgroundColor: theme.line }]} />
          <Text style={[styles.title, { color: theme.text }]}>Actions crédit</Text>

          {items.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => run(item.onPress)}
              style={[
                styles.item,
                { backgroundColor: theme.backgroundElement, borderColor: theme.line },
              ]}
            >
              <View style={[styles.iconBubble, { backgroundColor: theme.primarySoft }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={theme.primary}
                />
              </View>
              <View style={styles.itemBody}>
                <Text style={[styles.itemLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.two,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 12,
  },
});