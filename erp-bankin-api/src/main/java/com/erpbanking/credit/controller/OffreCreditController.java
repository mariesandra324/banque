package com.erpbanking.credit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.OffreCreditRequest;
import com.erpbanking.credit.dto.OffreCreditResponse;
import com.erpbanking.credit.service.OffreCreditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/offres-credit")
@RequiredArgsConstructor
public class OffreCreditController {

    private final OffreCreditService offreCreditService;
    

    /**
     * Créer une offre de crédit
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE_CREDIT')")
    public ResponseEntity<OffreCreditResponse> create(
            @RequestBody OffreCreditRequest request) {

        OffreCreditResponse response =
                offreCreditService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<OffreCreditResponse> consulter(@PathVariable String token) {
        return ResponseEntity.ok(offreCreditService.consulterParToken(token));
    }

    @PostMapping("/token/{token}/accepter")
    public ResponseEntity<CreditResponse> accepter(@PathVariable String token) {
        return ResponseEntity.ok(offreCreditService.accepterParToken(token));
    }

    @PostMapping("/token/{token}/refuser")
    public ResponseEntity<OffreCreditResponse> refuser(@PathVariable String token) {
        return ResponseEntity.ok(offreCreditService.refuserParToken(token));
    }
    /**
     * Récupérer toutes les offres
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE_CREDIT')")
    public ResponseEntity<List<OffreCreditResponse>> getAll() {

        return ResponseEntity.ok(
                offreCreditService.getAll()
        );
    }

    /**
     * Récupérer une offre par son ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'AGENT',
                'GESTIONNAIRE_CREDIT',
                'CLIENT'
            )
            """)
    public ResponseEntity<OffreCreditResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                offreCreditService.getById(id)
        );
    }

    /**
     * Récupérer les offres d'un client
     */
    @GetMapping("/client/{clientId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'AGENT',
                'GESTIONNAIRE_CREDIT',
                'CLIENT'
            )
            """)
    public ResponseEntity<List<OffreCreditResponse>> getByClientId(
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                offreCreditService.getByClientId(clientId)
        );
    }

    /**
     * Récupérer les offres liées à une demande
     */
    @GetMapping("/demande/{demandeCreditId}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'AGENT',
                'GESTIONNAIRE_CREDIT',
                'CLIENT'
            )
            """)
    public ResponseEntity<List<OffreCreditResponse>>
    getByDemandeCreditId(
            @PathVariable Long demandeCreditId) {

        return ResponseEntity.ok(
                offreCreditService
                        .getByDemandeCreditId(demandeCreditId)
        );
    }

    /**
     * Modifier le statut d'une offre
     */
    @PutMapping("/{id}/statut/{statut}")
    @PreAuthorize("""
            hasAnyRole(
                'ADMIN',
                'AGENT',
                'GESTIONNAIRE_CREDIT',
                'CLIENT'
            )
            """)
    public ResponseEntity<OffreCreditResponse> updateStatut(
            @PathVariable Long id,
            @PathVariable String statut) {

        return ResponseEntity.ok(
                offreCreditService.updateStatut(id, statut)
        );
    }

    /**
     * Supprimer une offre
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE_CREDIT')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        offreCreditService.delete(id);

        return ResponseEntity.noContent().build();
    }

    
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE_CREDIT')")
        public ResponseEntity<CreditResponse> accepterOffre(
                @PathVariable Long id) {

        return ResponseEntity.ok(
                offreCreditService.accepterOffre(id)
        );
        }
}
