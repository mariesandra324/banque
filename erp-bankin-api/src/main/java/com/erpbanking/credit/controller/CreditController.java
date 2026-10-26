package com.erpbanking.credit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.erpbanking.credit.dto.CreditRequest;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.EcheanceResponse;
import com.erpbanking.credit.dto.EcheancierGlobalResponse;
import com.erpbanking.credit.dto.RemboursementResponse;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.service.CreditService;
import com.erpbanking.credit.service.EcheancierService;
import com.erpbanking.credit.service.RemboursementService;
import com.erpbanking.credit.service.CreditOptimizationService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;
    private final CreditOptimizationService creditOptimizationService;
    private final EcheancierService echeancierService;
    private final RemboursementService remboursementService;

    @PostMapping("/optimize")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT','GESTIONNAIRE')")
    public ResponseEntity<List<DemandeCreditResponse>> optimize(
            @RequestParam @Min(0) @Max(1_000_000) int budget) {
        return ResponseEntity.ok(
                creditOptimizationService.optimizePendingApplications(budget)
        );
    }

    // Créer un crédit
    @PostMapping
    public ResponseEntity<CreditResponse> create(
            @RequestBody CreditRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(creditService.create(request));
    }

    // Récupérer tous les crédits
    @GetMapping
    public ResponseEntity<List<CreditResponse>> getAll() {

        return ResponseEntity.ok(
                creditService.getAll()
        );
    }

    // Récupérer un crédit par ID
    @GetMapping("/{id}")
    public ResponseEntity<CreditResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                creditService.getById(id)
        );
    }

    // Récupérer par numéro de crédit
    @GetMapping("/numero/{numeroCredit}")
    public ResponseEntity<CreditResponse> getByNumero(
            @PathVariable String numeroCredit) {

        return ResponseEntity.ok(
                creditService.getByNumero(numeroCredit)
        );
    }

    // Récupérer les crédits d'un client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<CreditResponse>> getByClient(
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                creditService.getByClientId(clientId)
        );
    }

    // Échéancier global de tous les crédits, avec client et montant.
    // Réservé à l'administrateur et au comptable (page Comptabilité).
    @GetMapping("/echeancier")
    @PreAuthorize("hasAnyRole('ADMIN','COMPTABLE')")
    public ResponseEntity<List<EcheancierGlobalResponse>> getEcheancierGlobal(
            @RequestParam(required = false) StatutEcheance statut) {

        return ResponseEntity.ok(
                echeancierService.getEcheancierGlobal(statut)
        );
    }

    // Récupérer par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<CreditResponse>> getByStatut(
            @PathVariable StatutCredit statut) {

        return ResponseEntity.ok(
                creditService.getByStatut(statut)
        );
    }

    // récuperer l'échéancier d'un crédit
    @GetMapping("/{id}/echeancier")
        public ResponseEntity<List<EcheanceResponse>> getEcheancier(
                @PathVariable Long id) {

        return ResponseEntity.ok(
                echeancierService.getEcheancier(id)
        );
     }

     // récuperer le remboursement
     @PostMapping("/{creditId}/remboursement/{echeanceId}")
        public ResponseEntity<RemboursementResponse> effectuerRemboursement(
                @PathVariable Long creditId,
                @PathVariable Long echeanceId) {

        return ResponseEntity.ok(
                remboursementService.effectuerRemboursement(
                        creditId,
                        echeanceId
                )
        );
      }

      //historique de remboursement
      @GetMapping("/{creditId}/remboursements")
        public ResponseEntity<List<RemboursementResponse>> getRemboursements(
                @PathVariable Long creditId) {

        return ResponseEntity.ok(
                remboursementService
                        .getRemboursementsByCredit(creditId)
        );
        }




}