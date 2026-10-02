package com.erpbanking.notification.entity;

/**
 * Catalogue des types de notifications métier.
 *
 * Chaque type est rattaché à un rôle cible (ADMIN, AGENT, GESTIONNAIRE,
 * COMPTABLE ou CLIENT) : une notification créée pour un rôle est diffusée à
 * tous les utilisateurs connectés possédant ce rôle.
 */
public enum NotificationType {

    // ============ ADMIN ============
    CLIENT_CREE("ADMIN", "\uD83D\uDD14", "Nouveau client enregistré"),
    COMPTE_CREE("ADMIN", "\uD83D\uDD14", "Nouveau compte créé"),
    EVENEMENT_SYSTEME("ADMIN", "\u26A0\uFE0F", "Événement système important"),

    // ============ AGENT ============
    CLIENT_A_TRAITER("AGENT", "\uD83D\uDD14", "Nouveau client à vérifier"),
    COMPTE_CREE_AGENT("AGENT", "\uD83D\uDD14", "Compte bancaire créé avec succès"),
    TRANSACTION_EFFECTUEE("AGENT", "\uD83D\uDD14", "Transaction enregistrée"),

    // ============ CLIENT ============
    DEPOT_EFFECTUE("CLIENT", "\uD83D\uDCB0", "Dépôt effectué sur votre compte"),
    RETRAIT_EFFECTUE("CLIENT", "\uD83D\uDCB8", "Retrait effectué"),
    VIREMENT_RECU("CLIENT", "\uD83D\uDCB0", "Vous avez reçu un virement"),
    VIREMENT_EFFECTUE("CLIENT", "\uD83D\uDCB8", "Virement effectué"),
    DEMANDE_CREDIT_SOUMISE("CLIENT", "\uD83D\uDD14", "Votre demande de crédit a été envoyée"),
    DEMANDE_CREDIT_DECIDEE("CLIENT", "\uD83D\uDD14", "Mise à jour de votre demande de crédit"),
    OFFRE_CREDIT_RECUE("CLIENT", "\uD83D\uDCB3", "Nouvelle offre de crédit disponible"),
    CREDIT_ACCORDE("CLIENT", "\uD83D\uDCB3", "Votre crédit a été accordé"),
    ECHEANCE_PROCHAINE("CLIENT", "\u23F0", "Votre échéance de crédit approche"),

    // ============ GESTIONNAIRE ============
    DEMANDE_CREDIT_A_TRAITER("GESTIONNAIRE", "\uD83D\uDD14", "Nouvelle demande de crédit à traiter"),
    PIECE_JOINTE_AJOUTEE("GESTIONNAIRE", "\uD83D\uDCCE", "Nouvelle pièce jointe dans une demande"),
    CLIENT_REPONSE_DEMANDE("GESTIONNAIRE", "\uD83D\uDD14", "Nouvelle information concernant une demande"),
    OFFRE_ACCEPTEE("GESTIONNAIRE", "\uD83D\uDD14", "Offre de crédit acceptée"),
    OFFRE_REFUSEE("GESTIONNAIRE", "❌", "Offre de crédit refusée par le client"),
    REMBOURSEMENT_RECU("GESTIONNAIRE", "\uD83D\uDCB0", "Remboursement reçu"),

    // ============ COMPTABLE ============
    TRANSACTION_A_COMPTABILISER("COMPTABLE", "\uD83D\uDD14", "Nouvelle transaction à comptabiliser"),
    CREDIT_A_ENREGISTRER("COMPTABLE", "\uD83D\uDD14", "Nouveau crédit à enregistrer"),
    REMBOURSEMENT_ENREGISTRE("COMPTABLE", "\uD83D\uDCB0", "Nouveau remboursement enregistré"),
    OPERATION_A_VERIFIER("COMPTABLE", "\u26A0\uFE0F", "Opération nécessitant une vérification");

    private final String roleCible;
    private final String emoji;
    private final String libelle;

    NotificationType(String roleCible, String emoji, String libelle) {
        this.roleCible = roleCible;
        this.emoji = emoji;
        this.libelle = libelle;
    }

    public String getRoleCible() {
        return roleCible;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getLibelle() {
        return libelle;
    }
}