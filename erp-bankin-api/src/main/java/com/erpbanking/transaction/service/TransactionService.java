package com.erpbanking.transaction.service;

import java.util.List;

import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;

public interface TransactionService {
    TransactionResponse effectuerTransaction(TransactionRequest request);
    List<TransactionResponse> obtenirHistoriqueCompte(String numeroCompte);
    List<TransactionResponse> obtenirToutesTransactions();
    TransactionResponse obtenirReference(String reference);
    TransactionResponse obtenirParReference(String reference);
    List<TransactionResponse> obtenirHistoriqueClient(Long clientId);
}
