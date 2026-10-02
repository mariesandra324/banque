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
    VALIDATION("Validation"),
    REFUS("Refus"),
    DESACTIVATION("Désactivation"),
    MODIFICATION_STATUT("Changement de statut");

    private final String libelle;

    AuditAction(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
