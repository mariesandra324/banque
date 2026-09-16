package com.erpbanking.mobile.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.client.dto.ClientDossierResponse;
import com.erpbanking.client.service.ClientService;
import com.erpbanking.mobile.dto.MobileDashboardResponse;
import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.transaction.dto.TransactionResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
public class MobileController {

    private final ClientService clientService;

    /**
     * Tableau de bord du client connecté sur mobile :
     * identité, comptes, solde total et dernières opérations.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<MobileDashboardResponse> dashboard(
            @AuthenticationPrincipal ClientUserDetails clientUserDetails
    ) {
        Long clientId = clientUserDetails.getClient().getId();

        ClientDossierResponse dossier = clientService.getDossier(clientId);

        List<TransactionResponse> dernieresOperations =
                dossier.getTransactions().stream()
                        .sorted(Comparator.comparing(
                                TransactionResponse::getDateTransaction,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        ))
                        .limit(5)
                        .toList();

        return ResponseEntity.ok(
                MobileDashboardResponse.builder()
                        .id(dossier.getClient().getId())
                        .nom(dossier.getClient().getNom())
                        .prenom(dossier.getClient().getPrenom())
                        .email(dossier.getClient().getEmail())
                        .telephone(dossier.getClient().getTelephone())
                        .comptes(dossier.getComptes())
                        .soldeTotal(dossier.getSoldeTotal())
                        .dernieresOperations(dernieresOperations)
                        .build()
        );
    }
}