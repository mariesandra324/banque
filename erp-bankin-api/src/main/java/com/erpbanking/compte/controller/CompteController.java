package com.erpbanking.compte.controller;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.compte.service.CompteService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.erpbanking.security.AuthorizationService;

@RestController
@RequestMapping("/api/comptes")
@RequiredArgsConstructor
public class CompteController {


    private final CompteService compteService;
    private final AuthorizationService authorizationService;


    // Création d'un compte
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<CompteResponse> create(
            @RequestBody CompteRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(compteService.create(request));
    }

    // Preview generated account number for selected client and type
    @GetMapping("/preview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Map<String, String>> previewNumero(
            @RequestParam Long clientId,
            @RequestParam(required = false) String typeCompte
    ) {
        String numero = compteService.previewNumeroCompte(clientId, typeCompte);
        return ResponseEntity.ok(Map.of("numeroCompte", numero));
    }


    // Liste des comptes
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE')")
    public ResponseEntity<List<CompteResponse>> findAll() {

        return ResponseEntity.ok(
                compteService.findAll()
        );
    }


    // Recherche d'un compte par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE') or @authorizationService.isCompteOwner(#id)")
    public ResponseEntity<CompteResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                compteService.findById(id)
        );
    }


    // Modification d'un compte
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<CompteResponse> update(
            @PathVariable Long id,
            @RequestBody CompteRequest request
    ) {

        return ResponseEntity.ok(
                compteService.update(id, request)
        );
    }


    // Suppression d'un compte
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        compteService.delete(id);

        return ResponseEntity.noContent().build();
    }
}