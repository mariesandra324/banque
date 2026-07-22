package com.erpbanking.transaction.controller;

import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // À ajuster selon vos règles CORS
public class TransactionController {

    private final TransactionService transactionService;

    // Effectuer une transaction (Dépôt, Retrait ou Virement)
    @PostMapping
    public ResponseEntity<TransactionResponse> effectuerTransaction(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.effectuerTransaction(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Récupérer l'historique des transactions d'un compte
    @GetMapping("/compte/{numeroCompte}")
    public ResponseEntity<List<TransactionResponse>> obtenirHistorique(@PathVariable String numeroCompte) {
        return ResponseEntity.ok(transactionService.obtenirHistoriqueCompte(numeroCompte));
    }

    // Consulter une transaction par sa référence (ex: TXN-A1B2C3D4)
    @GetMapping("/{reference}")
    public ResponseEntity<TransactionResponse> obtenirParReference(@PathVariable String reference) {
        return ResponseEntity.ok(transactionService.obtenirParReference(reference));
    }
}