package com.erpbanking.caisse.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class DemandeTransfertRequest {
    /**
     * Facultatif : un agent agit toujours sur son propre guichet.
     */
    private Long guichetId;

    @NotNull
    @Positive
    private BigDecimal montant;

    private String motif;
}
