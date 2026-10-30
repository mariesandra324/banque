import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Gradients } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface AuthBrandProps {
  caption?: string;
}

/** En-tête de marque commun aux écrans d'authentification. */
export function AuthBrand({ caption = "Espace client sécurisé" }: AuthBrandProps) {
  const theme = useTheme();

  return (
    <View style={styles.brand}>
      <LinearGradient
        colors={Gradients.heroAccent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mark}
      >
        <Ionicons name="shield-checkmark" size={26} color="#ffffff" />
      </LinearGradient>
      <View>
        <Text style={[styles.name, { color: theme.text }]}>ERP Banking</Text>
        <Text style={[styles.caption, { color: theme.textSecondary }]}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  caption: {
    fontSize: 12,
    marginTop: 1,
  },
});
