package com.erpbanking.credit.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numeroCredit;
    private BigDecimal montant;
    private String tauxInteret;
    private LocalDateTime duree;
    private String mensualite;
    
    @Column(nullable = false)
    private LocalDateTime dateDebut;
    private String capitalRestant;
    private String statut;
}
