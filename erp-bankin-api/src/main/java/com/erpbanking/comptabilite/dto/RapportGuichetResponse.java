package com.erpbanking.comptabilite.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ligne du rapport de guichet aggregée par période et par guichet.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportGuichetResponse {

    private String periode;
    private String codeGuichet;
    private Long nombreOperations;
    private BigDecimal totalDepots;
    private BigDecimal totalRetraits;
    private BigDecimal totalVirements;
    private BigDecimal totalRemboursements;
}
