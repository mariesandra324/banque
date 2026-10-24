import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";

import { mobileInscription } from "@/modules/auth/authService";

export default function RegisterForm() {
  const { width } = useWindowDimensions();
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, isWide && styles.containerWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formContainer, isWide && styles.formContainerWide]}>
          <Text style={styles.title}>{"S'inscrire"}</Text>

          <Text style={styles.subtitle}>
            {"Demande d'accès mobile liée à votre dossier client existant."}
          </Text>

          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Jean Rakoto"
            value={nomComplet}
            onChangeText={setNomComplet}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.label}>CIN (12 chiffres) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : 101054123456"
            value={cin}
            onChangeText={setCin}
            keyboardType="numeric"
            maxLength={12}
          />

          <Text style={styles.label}>Mot de passe (code personnel) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Au moins 6 caractères"
            secureTextEntry
            value={motDePasse}
            onChangeText={setMotDePasse}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-saisissez le mot de passe"
            secureTextEntry
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleInscription}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Envoi..." : "Envoyer la demande"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backText}>
              Déjà inscrit ? <Text style={styles.backTextBold}>Se connecter</Text>
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
    backgroundColor: "#F5F7FC",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 30,
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
    maxWidth: 520,
    padding: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
    ...(Platform.OS === "web" ? ({ boxShadow: "0 30px 60px -30px rgba(15,23,42,0.18)" } as any) : {}),
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#7A8499",
    fontSize: 14,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#172033",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E1E7F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "#ffffff",
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1557A6",
    marginTop: 8,
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
    color: "#7A8499",
    fontSize: 14,
    textAlign: "center",
  },
  backTextBold: {
    color: "#1557A6",
    fontWeight: "700",
  },
});