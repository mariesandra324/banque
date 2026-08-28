package com.erpbanking.credit.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.service.DemandeCreditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/demandes-credit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DemandeCreditController {

    private final DemandeCreditService demandeCreditService;

        // Créer une demande de crédit
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'CLIENT')")
        public ResponseEntity<DemandeCreditResponse> creer(
            @RequestPart("demande")
                DemandeCreditRequest request,

                @RequestPart(
                        value = "fichiers",
                        required = false
                )
                List<MultipartFile> fichiers) {
                
        return ResponseEntity.ok(
                demandeCreditService.creer(request, fichiers)
        );
        }

        // Récupérer toutes les demandes
        @GetMapping
        @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE_CREDIT')")
        public ResponseEntity<List<DemandeCreditResponse>> getAll() {

                return ResponseEntity.ok(
                        demandeCreditService.getAll()
                );
        }

        // Récupérer une demande par ID
        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE_CREDIT')")
        public ResponseEntity<DemandeCreditResponse> getById(
                @PathVariable Long id) {

                return ResponseEntity.ok(
                        demandeCreditService.getById(id)
                );
        }

        // Récupérer les demandes d'un client
        @GetMapping("/client/{clientId}")
        @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE_CREDIT', 'CLIENT')")
        public ResponseEntity<List<DemandeCreditResponse>> getByClientId(
                @PathVariable Long clientId) {

                return ResponseEntity.ok(
                        demandeCreditService.getByClientId(clientId)
                );
        }

        // Récupérer les demandes par statut
        @GetMapping("/statut/{statut}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE_CREDIT')")
        public ResponseEntity<List<DemandeCreditResponse>> getByStatut(
                @PathVariable StatutDemandeCredit statut) {

                return ResponseEntity.ok(
                        demandeCreditService.getByStatut(statut)
                );
        }

        //méttre à jour le statut d'une demande
        @PutMapping("/{id}/statut")
        @PreAuthorize("hasRole('ADMIN') or hasRole('GESTIONNAIRE_CREDIT')")
        public ResponseEntity<DemandeCreditResponse> updateStatut(
                @PathVariable Long id,
                @RequestParam StatutDemandeCredit statut,
                @RequestBody(required = false) Map<String, String> body ) {

        String motifRejet = body != null ? body.get("motifRejet"):null;
        return ResponseEntity.ok(
                demandeCreditService.updateStatut(id, statut, motifRejet)
        );


        }

        
}