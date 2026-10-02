package com.erpbanking.credit.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.service.DemandeCreditService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/demandes-credit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DemandeCreditController {

    private final DemandeCreditService demandeCreditService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

        // Créer une demande de crédit
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAnyRole('ADMIN','AGENT', 'CLIENT')")
        public ResponseEntity<DemandeCreditResponse> creer(
            @RequestPart("demande") String demandeJson,

            @RequestPart(
                    value = "pieces",
                    required = false
            )
            List<MultipartFile> fichiers) throws Exception {

        System.out.println("JSON RECU : " + demandeJson);
        System.out.println("FICHIERS RECUS : "+ (fichiers == null ? "NULL" : fichiers.size()));
        
        if (fichiers != null) {
                for (MultipartFile fichier : fichiers) {
                System.out.println(
                        "FICHIER : " + fichier.getOriginalFilename()
                );
                }
        }

        DemandeCreditRequest request =
                objectMapper.readValue(
                        demandeJson,
                        DemandeCreditRequest.class
                );

        // La partie "demande" arrive en JSON brut (multipart) : @Valid ne peut pas
        // s'appliquer automatiquement, on déclenche donc la validation à la main.
        valider(request);

        System.out.println("DEMANDE CONVERTIE");

        return ResponseEntity.ok(
                demandeCreditService.creer(request, fichiers)
        );
        }

        private void valider(DemandeCreditRequest request) {

                Set<ConstraintViolation<DemandeCreditRequest>> violations =
                        validator.validate(request);

                if (violations.isEmpty()) {
                        return;
                }

                String message = violations.stream()
                        .map(v -> v.getPropertyPath() + " : " + v.getMessage())
                        .collect(Collectors.joining(" ; "));

                throw new IllegalArgumentException(message);
        }

        // Récupérer toutes les demandes
        @GetMapping
        @PreAuthorize("hasAnyRole('ADMIN','AGENT','GESTIONNAIRE','COMPTABLE')")
        public ResponseEntity<List<DemandeCreditResponse>> getAll() {

                return ResponseEntity.ok(
                        demandeCreditService.getAll()
                );
        }

        // Récupérer une demande par ID
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN','AGENT','GESTIONNAIRE','GESTIONNAIRE')")
        public ResponseEntity<DemandeCreditResponse> getById(
                @PathVariable Long id) {

                return ResponseEntity.ok(
                        demandeCreditService.getById(id)
                );
        }

        // Récupérer les demandes d'un client
        @GetMapping("/client/{clientId}")
        @PreAuthorize("hasAnyRole('ADMIN','AGENT','GESTIONNAIRE','GESTIONNAIRE', 'CLIENT')")
        public ResponseEntity<List<DemandeCreditResponse>> getByClientId(
                @PathVariable Long clientId) {

                return ResponseEntity.ok(
                        demandeCreditService.getByClientId(clientId)
                );
        }

        // Récupérer les demandes par statut
        @GetMapping("/statut/{statut}")
        @PreAuthorize("hasAnyRole('ADMIN','AGENT','GESTIONNAIRE','GESTIONNAIRE')")
        public ResponseEntity<List<DemandeCreditResponse>> getByStatut(
                @PathVariable StatutDemandeCredit statut) {

                return ResponseEntity.ok(
                        demandeCreditService.getByStatut(statut)
                );
        }

        //méttre à jour le statut d'une demande
        @PutMapping("/{id}/statut")
        @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE','GESTIONNAIRE')")
        public ResponseEntity<DemandeCreditResponse> updateStatut(
                @PathVariable Long id,
                @RequestParam StatutDemandeCredit statut,
			@RequestParam(required = false) String motif) {

		return ResponseEntity.ok(
				demandeCreditService.updateStatut(id, statut, motif)
		);
	}

        @PutMapping("/{id}/ACCEPTER")
        @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE','GESTIONNAIRE')")
        public ResponseEntity<DemandeCreditResponse> accepter(
                @PathVariable Long id) {

        return ResponseEntity.ok(
                demandeCreditService.accepter(id)
        );
        }
}