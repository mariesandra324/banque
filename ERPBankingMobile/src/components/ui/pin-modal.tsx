import { useState } from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./button";

interface PinModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: (pin: string) => Promise<void> | void;
  children?: React.ReactNode;
}

export function PinModal({ visible, title, onCancel, onConfirm, children }: PinModalProps) {
  const theme = useTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPin("");
    setError(null);
    setLoading(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError("Le code PIN doit contenir 4 chiffres.");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(pin);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={[styles.grabber, { backgroundColor: theme.line }]} />

          <View style={[styles.iconBubble, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="shield-checkmark-outline" size={28} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          {children}

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Saisissez votre code PIN</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderBottomColor: theme.primary }]}
            value={pin}
            onChangeText={(v) => {
              setPin(v.replace(/\D/g, "").slice(0, 4));
              setError(null);
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            autoFocus
            placeholder="••••"
            placeholderTextColor={theme.textSecondary}
          />

          {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

          <View style={styles.actions}>
            <Button title="Annuler" variant="ghost" onPress={handleCancel} style={styles.action} />
            <Button
              title="Confirmer"
              loading={loading}
              onPress={handleConfirm}
              style={styles.action}
            />
          </View>

          <Pressable onPress={handleCancel} style={styles.close} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.textSecondary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    gap: Spacing.three,
    alignItems: "center",
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
  },
  input: {
    width: 180,
    height: 56,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 10,
    textAlign: "center",
    borderBottomWidth: 2,
  },
  error: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    alignSelf: "stretch",
    marginTop: Spacing.two,
  },
  action: {
    flex: 1,
  },
  close: {
    position: "absolute",
    top: Spacing.three,
    right: Spacing.three,
  },
});