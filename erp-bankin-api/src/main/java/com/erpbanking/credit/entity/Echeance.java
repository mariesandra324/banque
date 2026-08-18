package com.erpbanking.credit.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Echeance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Long id;

    private String numeroEcheance;

    @Column(nullable = false)
    private LocalDateTime dateEcheance;

    private String montant;

    private String capital;

    private String restDu;

    private String statut;
}
