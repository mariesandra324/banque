package com.erpbanking.client.controller;

import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.service.ClientService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {


    private final ClientService clientService;


    // Création d'un client
    @PostMapping
    public ResponseEntity<ClientResponse> create(
            @RequestBody ClientRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientService.create(request));
    }


    // Liste des clients
    @GetMapping
    public ResponseEntity<List<ClientResponse>> findAll() {

        return ResponseEntity.ok(
                clientService.findAll()
        );
    }


    // Recherche par ID
    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                clientService.findById(id)
        );
    }


    // Modification d'un client
    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(
            @PathVariable Long id,
            @RequestBody ClientRequest request
    ) {

        return ResponseEntity.ok(
                clientService.update(id, request)
        );
    }


    // Suppression d'un client
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        clientService.delete(id);

        return ResponseEntity.noContent().build();
    }
}