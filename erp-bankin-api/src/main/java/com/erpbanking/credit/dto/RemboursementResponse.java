package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class RemboursementResponse {

    private Long id;
    private String numeroRemboursement;
    private BigDecimal montant;
    private LocalDateTime dateRemboursement;
    private Long creditId;
    private Long echeanceId;
}