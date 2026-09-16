package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.erpbanking.credit.entity.StatutEcheance;

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
public class EcheanceResponse {

    private Long id;
    private Integer numeroEcheance;
    private LocalDate dateEcheance;
    private BigDecimal montant;
    private BigDecimal capital;
    private BigDecimal interet;
    private BigDecimal capitalRestant;
    private StatutEcheance statut;
}