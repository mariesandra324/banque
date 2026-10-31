package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClotureCaisseResponse {

    private Long sessionId;
    private Long guichetId;
    private String codeGuichet;
    private Long agentId;
    private String agentNom;
    private String statut;
    private LocalDateTime dateOuverture;
    private LocalDateTime dateFermeture;
    private BigDecimal soldeOuverture;
    private BigDecimal totalEntrees;
    private BigDecimal totalSorties;
    private BigDecimal totalTransferts;
    private BigDecimal soldeTheorique;
    private BigDecimal soldeFermeture;
    private BigDecimal ecart;
    private String statutValidation;
    private LocalDateTime dateValidation;
    private String valideParNom;
    private String motifRejet;
    private String observation;
}
