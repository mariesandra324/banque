package com.erpbanking.credit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.erpbanking.credit.dto.CreditRequest;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.service.CreditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;

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

    // Récupérer par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<CreditResponse>> getByStatut(
            @PathVariable StatutCredit statut) {

        return ResponseEntity.ok(
                creditService.getByStatut(statut)
        );
    }
}