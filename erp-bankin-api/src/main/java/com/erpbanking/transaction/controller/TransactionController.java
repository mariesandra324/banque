package com.erpbanking.transaction.controller;

import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.security.AuthorizationService;
import com.erpbanking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class TransactionController {

    private final TransactionService transactionService;
    private final AuthorizationService authorizationService;

    // Effectuer une transaction (Dépôt, Retrait ou Virement)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('AGENT') or hasRole('COMPTABLE')")
    public ResponseEntity<TransactionResponse> effectuerTransaction(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.effectuerTransaction(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Récupérer toutes les transactions
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE')")
    public ResponseEntity<List<TransactionResponse>> obtenirToutesTransactions() {
        return ResponseEntity.ok(transactionService.obtenirToutesTransactions());
    }

    // Récupérer l'historique des transactions d'un compte (alias historique)
    @GetMapping({"/compte/{numeroCompte}", "/historique/{numeroCompte}"})
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE') or @authorizationService.isCompteOwnerByNumeroCompte(#numeroCompte)")
    public ResponseEntity<List<TransactionResponse>> obtenirHistorique(@PathVariable String numeroCompte) {
        return ResponseEntity.ok(transactionService.obtenirHistoriqueCompte(numeroCompte));
    }

    // Consulter une transaction par sa référence (ex: TXN-A1B2C3D4)
    @GetMapping("/{reference}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE') or @authorizationService.isTransactionOwnerByReference(#reference)")
    public ResponseEntity<TransactionResponse> obtenirParReference(@PathVariable String reference) {
        return ResponseEntity.ok(transactionService.obtenirParReference(reference));
    }

    //récupere l'historique de client
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or hasRole('COMPTABLE') or hasRole('GESTIONNAIRE')")
    public ResponseEntity<List<TransactionResponse>> obtenirHistoriqueClient(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(
                transactionService.obtenirHistoriqueClient(clientId)
        );
    }
}