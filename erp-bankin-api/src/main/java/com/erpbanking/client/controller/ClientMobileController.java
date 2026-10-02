package com.erpbanking.client.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.erpbanking.client.dto.ClientMobileCreateRequest;
import com.erpbanking.client.dto.ClientMobileResponse;
import com.erpbanking.client.entity.StatutMobile;
import com.erpbanking.client.service.ClientMobileService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/client-mobile")
@RequiredArgsConstructor
public class ClientMobileController {

    private final ClientMobileService clientMobileService;

    @PostMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE')")
    public ResponseEntity<ClientMobileResponse> creerAccesMobile(
            @PathVariable Long clientId,
            @Valid @RequestBody ClientMobileCreateRequest request) {

        ClientMobileResponse response =
            clientMobileService.creerAccesMobile(
                clientId,
                request
            );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<ClientMobileResponse>> listerTous() {

        return ResponseEntity.ok(
            clientMobileService.listerTous()
        );
    }

    @PatchMapping("/{id}/statut/{statut}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientMobileResponse> mettreAJourStatut(
            @PathVariable Long id,
            @PathVariable StatutMobile statut) {

        return ResponseEntity.ok(
            clientMobileService.mettreAJourStatut(id, statut)
        );
    }
}