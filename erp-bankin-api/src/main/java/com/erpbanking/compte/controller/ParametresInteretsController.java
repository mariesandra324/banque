package com.erpbanking.compte.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.compte.dto.ParametresInteretsRequest;
import com.erpbanking.compte.dto.ParametresInteretsResponse;
import com.erpbanking.compte.service.ParametresInteretsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comptes/interets-mensuels")
@RequiredArgsConstructor
public class ParametresInteretsController {

    private final ParametresInteretsService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ParametresInteretsResponse> get() {
        return ResponseEntity.ok(service.get());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParametresInteretsResponse> update(
            @Valid @RequestBody ParametresInteretsRequest request) {
        return ResponseEntity.ok(service.update(request));
    }
}
