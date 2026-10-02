package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.erpbanking.credit.entity.StatutEcheance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ligne d'échéancier enrichie des informations client et crédit, pour
 * l'échéancier global de la page Comptabilité.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcheancierGlobalResponse {

    private Long id;
    private Integer numeroEcheance;
    private LocalDate dateEcheance;
    private BigDecimal montant;
    private BigDecimal capital;
    private BigDecimal interet;
    private BigDecimal capitalRestant;
    private StatutEcheance statut;

    private Long creditId;
    private String numeroCredit;
    private Long clientId;
    private String clientNom;
    private String clientPrenom;
}
