package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.credit.entity.StatutCredit;

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
public class CreditResponse {
     
    private Long id;
    private String numeroCredit;
    private BigDecimal montant;
    private BigDecimal tauxInteret;
    private Integer duree;
    private BigDecimal mensualite;
    private LocalDateTime dateDebut;
    private BigDecimal capitalRestant;
    private StatutCredit statut;

    private Long demandeCreditId;
    private Long clientId;
    private String clientNom;
    private String clientPrenom;
}
