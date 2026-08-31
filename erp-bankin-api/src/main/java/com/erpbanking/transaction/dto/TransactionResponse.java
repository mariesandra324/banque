package com.erpbanking.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.transaction.entity.StatutTransaction;
import com.erpbanking.transaction.entity.TypeTransaction;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {
    
    private Long id;
    private String reference;
    private TypeTransaction type;
    private BigDecimal montant;
    private LocalDateTime dateTransaction;
    private String description;
    private StatutTransaction statut;
    private String numeroCompteSource;
    private String numeroCompteDestination;
}
