package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.transaction.entity.Transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCaisseResponse {

    private Long id;
    private String reference;
    private String type;
    private BigDecimal montant;
    private LocalDateTime dateTransaction;
    private String description;
    private String statut;

    public static TransactionCaisseResponse from(Transaction transaction) {
        return TransactionCaisseResponse.builder()
                .id(transaction.getId())
                .reference(transaction.getReference())
                .type(transaction.getType() != null ? transaction.getType().name() : null)
                .montant(transaction.getMontant())
                .dateTransaction(transaction.getDateTransaction())
                .description(transaction.getDescription())
                .statut(transaction.getStatut() != null ? transaction.getStatut().name() : null)
                .build();
    }
}
