package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffreCreditResponse {

    private Long id;

    private String numeroOffre;

    private Long demandeCreditId;
    private String demandeProfession;
    private String demandeTypeContrat;
    private String demandeMotif;
    private LocalDateTime demandeDateDecision;

    private Long clientId;
    private String clientNom;
    private String clientPrenom;
    
    private BigDecimal montantPropose;

    private BigDecimal tauxInteret;

    private Integer duree;

    private BigDecimal mensualite;

    private LocalDate dateOffre;
    private LocalDate dateDebut;
    private LocalDate dateExpiration;

    private String conditions;

    private String statut;
}
