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
    @PreAuthorize("hasAuthority('COMPTE_CREATE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<CompteResponse> create(
            @RequestBody CompteRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(compteService.create(request));
    }

    // Preview generated account number for selected client and type
    @GetMapping("/preview")
    @PreAuthorize("hasAuthority('COMPTE_CREATE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<Map<String, String>> previewNumero(
            @RequestParam Long clientId,
            @RequestParam(required = false) String typeCompte
    ) {
        String numero = compteService.previewNumeroCompte(clientId, typeCompte);
        return ResponseEntity.ok(Map.of("numeroCompte", numero));
    }


    // Liste des comptes
    @GetMapping
    @PreAuthorize("hasAuthority('COMPTE_READ') or hasAnyRole('SUPER_ADMIN','ADMIN','GESTIONNAIRE','AGENT','COMPTABLE')")
    public ResponseEntity<List<CompteResponse>> findAll() {

        return ResponseEntity.ok(
                compteService.findAll()
        );
    }


    // Recherche d'un compte par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('COMPTE_READ') or hasAnyRole('SUPER_ADMIN','ADMIN','GESTIONNAIRE','AGENT','COMPTABLE') or @authorizationService.isCompteOwner(#id)")
    public ResponseEntity<CompteResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                compteService.findById(id)
        );
    }


    // Modification d'un compte
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('COMPTE_CLOSE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<CompteResponse> update(
            @PathVariable Long id,
            @RequestBody CompteRequest request
    ) {

        return ResponseEntity.ok(
                compteService.update(id, request)
        );
    }

    // Changement de statut d'un compte
    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAuthority('COMPTE_CLOSE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<CompteResponse> updateStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        return ResponseEntity.ok(compteService.updateStatut(id, request.get("statut")));
    }


    // Suppression d'un compte
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COMPTE_CLOSE') or hasAnyRole('SUPER_ADMIN','ADMIN','AGENT')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        compteService.delete(id);

        return ResponseEntity.noContent().build();
    }
}