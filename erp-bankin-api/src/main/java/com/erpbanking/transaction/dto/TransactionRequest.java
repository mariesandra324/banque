package com.erpbanking.transaction.dto;

import com.erpbanking.transaction.entity.TypeTransaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionRequest {

    @NotNull(message = "Le type de transaction est obligatoire")
    private TypeTransaction type; 

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "1.00", message = "Le montant minimum est de 1.00")
    private BigDecimal montant;

    @NotNull(message = "Le RIB/Numéro du compte source est obligatoire")
    private String numeroCompteSource;

    // Optionnel, requis uniquement en cas de VIREMENT
    private String numeroCompteDestination;

    private String description;
}