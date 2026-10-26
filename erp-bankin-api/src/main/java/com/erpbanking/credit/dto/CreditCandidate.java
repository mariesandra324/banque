package com.erpbanking.credit.dto;

import java.math.BigDecimal;

public record CreditCandidate(
        Long demandeCreditId,
        long amountIndex,
        BigDecimal expectedGain) {
}
