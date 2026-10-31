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
public class PositionCashResponse {

    private BigDecimal positionTotale;
    private List<GuichetCashResponse> guichets;
}
