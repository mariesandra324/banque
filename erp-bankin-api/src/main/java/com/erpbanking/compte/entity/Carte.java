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

    @Column(name = "numero_carte", nullable = false, unique = true, length = 16)
    private String numeroCarte;

    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "type_carte", nullable = false)
    private String typeCarte;


    @Column(name = "statut", nullable = false)
    private String statut;

    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @OneToOne
    @JoinColumn(name = "compte_id", nullable = false, unique = true)
    private Compte compte;
}

