package com.erpbanking.compte.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParametresInteretsResponse {

    private BigDecimal montantCourant;
    private BigDecimal montantEpargne;
}
