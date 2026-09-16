package com.erpbanking.client.controller;

import com.erpbanking.client.dto.ClientDossierResponse;
import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.service.ClientService;
import com.erpbanking.security.AuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ClientController {


    private final ClientService clientService;
    private final AuthorizationService authorizationService;


    // Création d'un client
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<ClientResponse> create(
            @Valid @RequestBody ClientRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clientService.create(request));
    }


    // Liste des clients
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE')")
    public ResponseEntity<List<ClientResponse>> findAll() {

        return ResponseEntity.ok(
                clientService.findAll()
        );
    }
    
    @GetMapping("/{id}/dossier")
        @PreAuthorize(
                "hasRole('ADMIN') or " +
                "hasRole('GESTIONNAIRE') or " +
                "hasRole('AGENT') or " +
                "hasRole('COMPTABLE') or " +
                "@authorizationService.isClientOwner(#id)"
        )
        public ResponseEntity<ClientDossierResponse> getDossier(
                @PathVariable Long id
        ) {
        return ResponseEntity.ok(
                clientService.getDossier(id)
        );
        }


    // Recherche par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE') or @authorizationService.isClientOwner(#id)")
    public ResponseEntity<ClientResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                clientService.findById(id)
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE') or hasRole('AGENT') or hasRole('COMPTABLE')")
    public ResponseEntity<List<ClientResponse>> searchClients(@RequestParam("query") String query) {
        List<ClientResponse> results = clientService.searchClients(query);
        return ResponseEntity.ok(results);
    }


    // Modification d'un client
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or @authorizationService.isClientOwner(#id)")
    public ResponseEntity<ClientResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequest request
    ) {

        return ResponseEntity.ok(
                clientService.update(id, request)
        );
    }


    // Suppression d'un client
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        clientService.delete(id);

        return ResponseEntity.noContent().build();
    }

    
}