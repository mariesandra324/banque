package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OffreCreditRequest {

    private Long demandeCreditId;

    private BigDecimal montantPropose;

    private BigDecimal tauxInteret;

    private Integer duree;

    private BigDecimal mensualite;

    private LocalDate dateExpiration;

    private String conditions;
}
