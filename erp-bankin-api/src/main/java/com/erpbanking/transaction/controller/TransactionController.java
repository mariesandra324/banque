package com.erpbanking.transaction.controller;

import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.security.AuthorizationService;
import com.erpbanking.transaction.service.TransactionService;
import com.erpbanking.utilisateur.entity.Utilisateur;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    @PreAuthorize("hasAuthority('TRANSACTION_CREATE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<TransactionResponse> effectuerTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        // Rattache la transaction au guichet de l'agent, pour le rapport de guichet.
        Guichet guichet = utilisateur != null ? utilisateur.getGuichet() : null;

        TransactionResponse response = transactionService.effectuerTransaction(
                request,
                guichet,
                utilisateur != null ? utilisateur.getId() : null);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Récupérer toutes les transactions
    @GetMapping
    @PreAuthorize("hasAuthority('TRANSACTION_VALIDATE') or hasAuthority('TRANSACTION_READ') or hasAnyRole('SUPER_ADMIN','ADMIN','GESTIONNAIRE','AGENT','COMPTABLE')")
    public ResponseEntity<List<TransactionResponse>> obtenirToutesTransactions() {
        return ResponseEntity.ok(transactionService.obtenirToutesTransactions());
    }

    // Récupérer l'historique des transactions d'un compte (alias historique)
    @GetMapping({"/compte/{numeroCompte}", "/historique/{numeroCompte}"})
    @PreAuthorize("hasAuthority('TRANSACTION_READ') or hasAnyRole('SUPER_ADMIN','ADMIN','GESTIONNAIRE','AGENT','COMPTABLE') or @authorizationService.isCompteOwnerByNumeroCompte(#numeroCompte)")
    public ResponseEntity<List<TransactionResponse>> obtenirHistorique(@PathVariable String numeroCompte) {
        return ResponseEntity.ok(transactionService.obtenirHistoriqueCompte(numeroCompte));
    }

    // Consulter une transaction par sa référence (ex: TXN-A1B2C3D4)
    @GetMapping("/{reference}")
    @PreAuthorize("hasAuthority('TRANSACTION_READ') or hasAnyRole('SUPER_ADMIN','ADMIN','GESTIONNAIRE','AGENT','COMPTABLE') or @authorizationService.isTransactionOwnerByReference(#reference)")
    public ResponseEntity<TransactionResponse> obtenirParReference(@PathVariable String reference) {
        return ResponseEntity.ok(transactionService.obtenirParReference(reference));
    }

    //récupere l'historique de client
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAuthority('TRANSACTION_VALIDATE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT','COMPTABLE','GESTIONNAIRE')")
    public ResponseEntity<List<TransactionResponse>> obtenirHistoriqueClient(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(
                transactionService.obtenirHistoriqueClient(clientId)
        );
    }

    @PostMapping("/{reference}/annuler")
    @PreAuthorize("hasAuthority('TRANSACTION_CANCEL') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<TransactionResponse> annulerTransaction(
            @PathVariable String reference
    ) {
        return ResponseEntity.ok(transactionService.annulerTransaction(reference));
    }
}