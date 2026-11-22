import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { mobileInscription } from "@/modules/auth/authService";
import { AuthBrand } from "@/components/ui/auth-brand";
import { Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function RegisterForm() {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const isWide = width >= 1024;
  const [nomComplet, setNomComplet] = useState("");
  const [cin, setCin] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInscription = async () => {
    if (!nomComplet.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre nom complet.");
      return;
    }
    if (!/^[0-9]{12}$/.test(cin.trim())) {
      Alert.alert("Erreur", "Le CIN doit contenir exactement 12 chiffres.");
      return;
    }
    if (motDePasse.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      Alert.alert("Erreur", "Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      const resultat = await mobileInscription({
        cin: cin.trim(),
        nomComplet: nomComplet.trim(),
        motDePasse: motDePasse,
      });
      Alert.alert(
        "Demande envoyée",
        resultat.message ?? "Votre demande d'accès mobile a été enregistrée.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Inscription impossible",
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "nom",
      label: "Nom complet *",
      icon: "person-outline" as const,
      placeholder: "Ex : Jean Rakoto",
      value: nomComplet,
      onChangeText: setNomComplet,
      autoCapitalize: "words" as const,
      secureTextEntry: false,
      keyboardType: "default" as const,
      maxLength: undefined,
    },
    {
      key: "cin",
      label: "CIN (12 chiffres) *",
      icon: "card-outline" as const,
      placeholder: "Ex : 101054123456",
      value: cin,
      onChangeText: setCin,
      autoCapitalize: "none" as const,
      secureTextEntry: false,
      keyboardType: "numeric" as const,
      maxLength: 12,
    },
    {
      key: "password",
      label: "Mot de passe (code personnel) *",
      icon: "lock-closed-outline" as const,
      placeholder: "Au moins 6 caractères",
      value: motDePasse,
      onChangeText: setMotDePasse,
      autoCapitalize: "none" as const,
      secureTextEntry: true,
      keyboardType: "default" as const,
      maxLength: undefined,
    },
    {
      key: "confirmation",
      label: "Confirmer le mot de passe *",
      icon: "lock-closed-outline" as const,
      placeholder: "Re-saisissez le mot de passe",
      value: confirmation,
      onChangeText: setConfirmation,
      autoCapitalize: "none" as const,
      secureTextEntry: true,
      keyboardType: "default" as const,
      maxLength: undefined,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[theme.backgroundTop, theme.backgroundBottom]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.container, isWide && styles.containerWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.formContainer,
            isWide && styles.formContainerWide,
            isWide && { backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1 },
          ]}
        >
          <AuthBrand caption="Demande d'accès mobile" />

          <Text style={[styles.title, { color: theme.text }]}>{"S'inscrire"}</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {"Demande d'accès mobile liée à votre dossier client existant."}
          </Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{field.label}</Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Ionicons name={field.icon} size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.textSecondary}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  autoCapitalize={field.autoCapitalize}
                  autoCorrect={false}
                  secureTextEntry={field.secureTextEntry}
                  keyboardType={field.keyboardType}
                  maxLength={field.maxLength}
                />
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              Shadows.card,
              { backgroundColor: theme.primary },
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleInscription}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Envoi…" : "Envoyer la demande"}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
          </Pressable>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.backText, { color: theme.textSecondary }]}>
              Déjà inscrit ?{" "}
              <Text style={[styles.backTextBold, { color: theme.primary }]}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  containerWide: {
    paddingHorizontal: 48,
  },
  formContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  formContainerWide: {
    maxWidth: 480,
    padding: 40,
    borderRadius: 28,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 10,
    ...(Platform.OS === "web" ? ({ boxShadow: "0 30px 70px -30px rgba(15,23,42,0.28)" } as any) : {}),
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    padding: 0,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  backLink: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    textAlign: "center",
  },
  backTextBold: {
    fontWeight: "700",
  },
});