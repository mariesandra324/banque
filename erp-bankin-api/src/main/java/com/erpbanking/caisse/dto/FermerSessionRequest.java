package com.erpbanking.caisse.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class FermerSessionRequest {
    private BigDecimal soldeFermeture;
    private String observation;
}
