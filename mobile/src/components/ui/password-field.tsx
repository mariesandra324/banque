import { useState } from "react";

import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface PasswordFieldProps extends Omit<TextInputProps, "style" | "secureTextEntry"> {
  label: string;
  /** Message d'erreur sous le champ ; bascule aussi la bordure en rouge. */
  error?: string;
}

/** Champ mot de passe avec œil de visibilité, dans le style des cartes de l'app. */
export function PasswordField({ label, error, ...inputProps }: PasswordFieldProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.field,
          Shadows.card,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.line,
          },
        ]}
      >
        <TextInput
          {...inputProps}
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <Pressable
          onPress={() => setVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          hitSlop={10}
          style={styles.eye}
        >
          <Ionicons
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={theme.textSecondary}
          />
        </Pressable>
      </View>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  eye: {
    paddingLeft: Spacing.two,
  },
  error: {
    fontSize: 12,
  },
});
