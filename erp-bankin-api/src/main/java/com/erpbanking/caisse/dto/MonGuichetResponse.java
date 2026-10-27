package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonGuichetResponse {

    private Long guichetId;
    private String codeGuichet;
    private Boolean guichetActif;
    private SessionCaisseResponse sessionOuverte;
    private BigDecimal soldeDisponible;
    private List<TransactionCaisseResponse> dernieresTransactions;
}
