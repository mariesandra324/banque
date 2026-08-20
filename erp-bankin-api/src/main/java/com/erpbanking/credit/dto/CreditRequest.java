package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
public class CreditRequest {

    private Long demandeCreditId;
    private BigDecimal montant;
    private BigDecimal tauxInteret;
    private LocalDateTime duree;
    private String mensualite;
    private LocalDateTime dateDebut;
}
