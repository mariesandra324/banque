package com.erpbanking.caisse.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuichetCashResponse {

    private Long utilisateurId;
    private String agentNom;
    private Long guichetId;
    private String codeGuichet;
    private BigDecimal soldeTheorique;
    private String statut;
}
