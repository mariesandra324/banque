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
  View,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { createCreditRequest, CreditPiece } from "@/services/creditsService";
import { Screen } from "@/components/ui/screen";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function NewCreditRequestScreen() {
  const theme = useTheme();
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();
  const compteId = accountId ? Number(accountId) : undefined;
  const [montant, setMontant] = useState("");
  const [dureeMois, setDureeMois] = useState("");
  const [motif, setMotif] = useState("");
  const [pieces, setPieces] = useState<CreditPiece[]>([]);
  const [loading, setLoading] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];
  const labelStyle = { color: theme.textSecondary };

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) return;
      const selected = (result.assets ?? [])
        .filter((a) => !!(a.uri || a.file))
        .map(
          (a): CreditPiece => ({
            uri: a.uri,
            name: a.name,
            mimeType: a.mimeType,
            size: a.size,
            file: a.file,
          })
        );
      setPieces((prev) => [...prev, ...selected]);
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir le sélecteur de fichiers.");
    }
  };

  const removePiece = (index: number) => {
    setPieces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const montantValue = Number(montant.replace(/\s/g, ""));
    if (!montantValue || montantValue <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un montant valide.");
      return;
    }
    const dureeValue = Number(dureeMois);
    if (!dureeValue || dureeValue < 1) {
      Alert.alert("Erreur", "Veuillez saisir une durée en mois.");
      return;
    }
    if (!motif.trim()) {
      Alert.alert("Erreur", "Veuillez préciser le motif de la demande.");
      return;
    }

    try {
      setLoading(true);
      await createCreditRequest({
        montant: montantValue,
        devise: "MGA",
        dureeMois: dureeValue,
        motif: motif.trim(),
        pieces,
        compteId,
      });
      Alert.alert("Demande envoyée", "Votre demande de crédit a été enregistrée.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(
        "Envoi impossible",
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <BackButton />
      <Section title="Nouvelle demande de crédit" />

      {compteId ? (
        <Text style={[styles.accountHint, { color: theme.primary }]}>
          Le crédit sera débloqué directement sur ce compte.
        </Text>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Card padded style={{ gap: Spacing.three }}>
            <Text style={[styles.label, labelStyle]}>Montant demandé (MGA)</Text>
            <TextInput
              style={inputStyle}
              placeholder="Ex : 10 000 000"
              placeholderTextColor={theme.textSecondary}
              value={montant}
              onChangeText={(v) => setMontant(v.replace(/[^\d\s]/g, ""))}
              keyboardType="number-pad"
            />

            <Text style={[styles.label, labelStyle]}>Durée (en mois)</Text>
            <TextInput
              style={inputStyle}
              placeholder="Ex : 36"
              placeholderTextColor={theme.textSecondary}
              value={dureeMois}
              onChangeText={(v) => setDureeMois(v.replace(/\D/g, ""))}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={[styles.label, labelStyle]}>Motif</Text>
            <TextInput
              style={[inputStyle, styles.multiline]}
              placeholder="Ex : Rénovation de la maison"
              placeholderTextColor={theme.textSecondary}
              value={motif}
              onChangeText={setMotif}
              multiline
            />

            <Text style={[styles.label, labelStyle]}>
              Pièces jointes du dossier ({pieces.length})
            </Text>
            {pieces.map((piece, index) => (
              <View
                key={`${piece.name}-${index}`}
                style={[styles.fileRow, { backgroundColor: theme.backgroundElement }]}
              >
                <Ionicons name="document-attach-outline" size={18} color={theme.primary} />
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                    {piece.name}
                  </Text>
                  {formatFileSize(piece.size) ? (
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      {formatFileSize(piece.size)}
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => removePiece(index)} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={theme.danger} />
                </Pressable>
              </View>
            ))}
            <Button
              title="+ Ajouter des pièces jointes"
              variant="secondary"
              onPress={handlePick}
            />
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Documents recommandés : CNI, justificatif de revenus, contrat de travail…
            </Text>
          </Card>

          <Button
            title={loading ? "Envoi..." : "Envoyer la demande"}
            loading={loading}
            onPress={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  accountHint: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  multiline: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
  },
});