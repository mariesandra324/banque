package com.erpbanking.audit.entity;

/**
 * Module métier concerné par l'action journalisée.
 * Alimente le filtre "Module" de l'écran d'audit.
 */
public enum AuditModule {
    CLIENTS("Clients"),
    COMPTES("Comptes"),
    TRANSACTIONS("Transactions"),
    CREDITS("Crédits"),
    CARTES("Cartes"),
    UTILISATEURS("Utilisateurs"),
    SYSTEME("Système");

    private final String libelle;

    AuditModule(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
