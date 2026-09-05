package com.erpbanking.compte.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cartes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carte {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Numéro unique de la carte
     * Exemple : 4532123456789012
     */
    @Column(name = "numero_carte", nullable = false, unique = true, length = 16)
    private String numeroCarte;

    /**
     * Date d'expiration
     */
    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    /**
     * Type de carte
     * Exemple : VISA, MASTERCARD
     */
    @Column(name = "type_carte", nullable = false)
    private String typeCarte;

    /**
     * Statut de la carte
     * Exemple : ACTIVE, BLOQUEE, EXPIREE
     */
    @Column(name = "statut", nullable = false)
    private String statut;

    /**
     * PIN hashé avec BCrypt.
     * On ne stocke JAMAIS le PIN en clair.
     */
    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    /**
     * Une carte appartient à un seul compte.
     * Un compte possède une seule carte.
     */
    @OneToOne
    @JoinColumn(name = "compte_id", nullable = false, unique = true)
    private Compte compte;
}

