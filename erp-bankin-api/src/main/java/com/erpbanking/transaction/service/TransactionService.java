package com.erpbanking.transaction.service;

import java.util.List;

import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;

public interface TransactionService {
    TransactionResponse effectuerTransaction(TransactionRequest request);

    // Memes operations, en rattachant la transaction au guichet traite.
    // Les mouvements automatiques de credit utilisent la version sans guichet.
    TransactionResponse effectuerTransaction(TransactionRequest request, Guichet guichet);

    List<TransactionResponse> obtenirHistoriqueCompte(String numeroCompte);
    List<TransactionResponse> obtenirToutesTransactions();
    TransactionResponse obtenirReference(String reference);
    TransactionResponse obtenirParReference(String reference);
    List<TransactionResponse> obtenirHistoriqueClient(Long clientId);
}
