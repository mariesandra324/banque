package com.erpbanking.audit.entity;

/**
 * Nature de l'action effectuée par l'utilisateur, indépendamment du module
 * concerné (Clients, Comptes, Transactions, Crédits, ...).
 */
public enum AuditAction {
    CREATION("Création"),
    MODIFICATION("Modification"),
    SUPPRESSION("Suppression"),
    DEPOT("Dépôt"),
    RETRAIT("Retrait"),
    VIREMENT("Virement"),
    TRANSFERT("Transfert vers le coffre"),
    VALIDATION("Validation"),
    ACCEPTATION("Acceptation"),
    REFUS("Refus"),
    DESACTIVATION("Désactivation"),
    OUVERTURE_SESSION("Ouverture de session"),
    FERMETURE_SESSION("Fermeture de session"),
    VALIDATION_CLOTURE("Validation de clôture"),
    REJET_CLOTURE("Rejet de clôture"),
    MODIFICATION_STATUT("Changement de statut");

    private final String libelle;

    AuditAction(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
