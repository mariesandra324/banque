package com.erpbanking.caisse.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.caisse.dto.ComptageCaisseResponse;
import com.erpbanking.caisse.dto.ComptageRequest;
import com.erpbanking.caisse.dto.DemandeTransfertCoffreResponse;
import com.erpbanking.caisse.dto.DemandeTransfertRequest;
import com.erpbanking.caisse.dto.FermerSessionRequest;
import com.erpbanking.caisse.dto.MonGuichetResponse;
import com.erpbanking.caisse.dto.OuvrirSessionRequest;
import com.erpbanking.caisse.dto.SessionCaisseResponse;
import com.erpbanking.caisse.dto.TraitementDemandeRequest;
import com.erpbanking.caisse.service.CaisseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caisse")
@RequiredArgsConstructor
public class CaisseController {

    private final CaisseService caisseService;

    @GetMapping("/mon-guichet")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN','GESTIONNAIRE')")
    public ResponseEntity<MonGuichetResponse> monGuichet() {
        return ResponseEntity.ok(caisseService.monGuichet());
    }

    @PostMapping("/ouvrir-session")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<SessionCaisseResponse> ouvrirSession(@Valid @RequestBody OuvrirSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caisseService.ouvrirSession(request));
    }

    @PostMapping("/fermer-session")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<SessionCaisseResponse> fermerSession(@RequestBody FermerSessionRequest request) {
        return ResponseEntity.ok(caisseService.fermerSession(request));
    }

    @PostMapping("/demande-transfert")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<DemandeTransfertCoffreResponse> creerDemandeTransfert(@Valid @RequestBody DemandeTransfertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caisseService.creerDemandeTransfert(request));
    }

    @GetMapping("/mes-demandes-transfert")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN','GESTIONNAIRE')")
    public ResponseEntity<List<DemandeTransfertCoffreResponse>> mesDemandesTransfert() {
        return ResponseEntity.ok(caisseService.mesDemandesTransfert());
    }

    @GetMapping("/demandes-transfert/en-attente")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<DemandeTransfertCoffreResponse>> demandesEnAttente() {
        return ResponseEntity.ok(caisseService.demandesTransfertEnAttente());
    }

    @PostMapping("/demandes-transfert/{id}/traiter")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<DemandeTransfertCoffreResponse> traiterDemande(@PathVariable Long id, @RequestBody TraitementDemandeRequest request) {
        return ResponseEntity.ok(caisseService.traiterDemandeTransfert(id, request));
    }

    @PostMapping("/comptage")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<ComptageCaisseResponse> comptage(@RequestBody ComptageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caisseService.enregistrerComptage(request));
    }

    @GetMapping("/mes-comptages")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN','GESTIONNAIRE')")
    public ResponseEntity<List<ComptageCaisseResponse>> mesComptages() {
        return ResponseEntity.ok(caisseService.mesComptages());
    }
}
