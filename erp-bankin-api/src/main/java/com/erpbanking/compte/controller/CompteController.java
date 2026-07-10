package com.erpbanking.compte.controller;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.compte.service.CompteService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/comptes")
@RequiredArgsConstructor
public class CompteController {


    private final CompteService compteService;


    // Création d'un compte
    @PostMapping
    public ResponseEntity<CompteResponse> create(
            @RequestBody CompteRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(compteService.create(request));
    }


    // Liste des comptes
    @GetMapping
    public ResponseEntity<List<CompteResponse>> findAll() {

        return ResponseEntity.ok(
                compteService.findAll()
        );
    }


    // Recherche d'un compte par ID
    @GetMapping("/{id}")
    public ResponseEntity<CompteResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                compteService.findById(id)
        );
    }


    // Modification d'un compte
    @PutMapping("/{id}")
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
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        compteService.delete(id);

        return ResponseEntity.noContent().build();
    }
}