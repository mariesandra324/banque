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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import jakarta.validation.Valid;

import com.erpbanking.security.ClientUserDetails;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE', 'GESTIONNAIRE')")
    public ResponseEntity<OffreCreditResponse> create(
            @Valid @RequestBody OffreCreditRequest request) {

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
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE', 'GESTIONNAIRE')")
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
                'GESTIONNAIRE', 'GESTIONNAIRE',
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
                'GESTIONNAIRE', 'GESTIONNAIRE',
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
                'GESTIONNAIRE', 'GESTIONNAIRE',
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
                'GESTIONNAIRE', 'GESTIONNAIRE',
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
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE', 'GESTIONNAIRE')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        offreCreditService.delete(id);

        return ResponseEntity.noContent().build();
    }

    
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'GESTIONNAIRE', 'GESTIONNAIRE', 'CLIENT')")
        public ResponseEntity<CreditResponse> accepterOffre(
                @PathVariable Long id,
                @AuthenticationPrincipal ClientUserDetails clientUserDetails) {

        Long clientId = clientUserDetails != null
                ? clientUserDetails.getClient().getId()
                : null;

        return ResponseEntity.ok(
                offreCreditService.accepterOffreParClient(id, clientId)
        );
        }

@GetMapping(
        value = "/token/{token}/confirmer-accepter",
        produces = MediaType.TEXT_HTML_VALUE
)
public String confirmerAccepter(@PathVariable String token) {

    return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirmation - ERP Banking</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f7fa;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }

                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        width: 90%%;
                        max-width: 500px;
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,.12);
                    }

                    h1 {
                        color: #1e293b;
                    }

                    p {
                        color: #64748b;
                        margin-bottom: 30px;
                    }

                    .buttons {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                    }

                    button {
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 15px;
                    }

                    .yes {
                        background: #16a34a;
                        color: white;
                    }

                    .no {
                        background: #e5e7eb;
                        color: #1f2937;
                    }
                </style>
            </head>

            <body>

                <div class="card">

                    <h1>Confirmation</h1>

                    <p>
                        Êtes-vous sûr de vouloir accepter cette offre de crédit ?
                    </p>

                    <div class="buttons">

                        <form method="post"
                              action="/api/offres-credit/token/%s/confirmer-accepter">

                            <button type="submit" class="yes">
                                Oui, accepter
                            </button>

                        </form>

                        <button
                                type="button"
                                class="no"
                                onclick="window.close(); history.back();">
                            Non
                        </button>

                    </div>

                </div>

            </body>
            </html>
            """.formatted(token);
}
@PostMapping(
        value = "/token/{token}/confirmer-accepter",
        produces = MediaType.TEXT_HTML_VALUE
)
public String confirmerAccepterPost(@PathVariable String token) {

    offreCreditService.accepterParToken(token);

    return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Offre acceptée</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f7fa;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }

                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,.12);
                    }

                    h1 {
                        color: #16a34a;
                    }
                </style>
            </head>

            <body>
                <div class="card">
                    <h1>✓ Offre acceptée</h1>

                    <p>
                        Votre offre de crédit a été acceptée avec succès.
                    </p>

                    <p>
                        Vous recevrez prochainement la confirmation
                        par email.
                    </p>
                </div>
            </body>
            </html>
            """;
}
@PostMapping(
        value = "/token/{token}/confirmer-refuser",
        produces = MediaType.TEXT_HTML_VALUE
)
public String confirmerRefuserPost(@PathVariable String token) {

    offreCreditService.refuserParToken(token);

    return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Offre refusée</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f7fa;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }

                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,.12);
                    }

                    h1 {
                        color: #dc2626;
                    }
                </style>
            </head>

            <body>
                <div class="card">
                    <h1>✓ Offre refusée</h1>

                    <p>
                        Votre offre de crédit a été refusée.
                    </p>

                    <p>
                        Une confirmation vous a été adressée par email.
                    </p>
                </div>
            </body>
            </html>
            """;
}

@GetMapping(
        value = "/token/{token}/confirmer-refuser",
        produces = MediaType.TEXT_HTML_VALUE
)
public String confirmerRefuser(@PathVariable String token) {

    return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirmation - ERP Banking</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f7fa;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }

                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        width: 90%%;
                        max-width: 500px;
                        text-align: center;
                        box-shadow: 0 10px 30px rgba(0,0,0,.12);
                    }

                    h1 {
                        color: #dc2626;
                    }

                    p {
                        color: #64748b;
                        margin-bottom: 30px;
                    }

                    .buttons {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                    }

                    button {
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 15px;
                    }

                    .yes {
                        background: #dc2626;
                        color: white;
                    }

                    .no {
                        background: #e5e7eb;
                        color: #1f2937;
                    }
                </style>
            </head>

            <body>

                <div class="card">

                    <h1>Confirmation</h1>

                    <p>
                        Êtes-vous sûr de vouloir refuser cette offre de crédit ?
                    </p>

                    <div class="buttons">

                        <form method="post"
                              action="/api/offres-credit/token/%s/confirmer-refuser">

                            <button type="submit" class="yes">
                                Oui, refuser
                            </button>

                        </form>

                        <button
                                type="button"
                                class="no"
                                onclick="window.close(); history.back();">
                            Non
                        </button>

                    </div>

                </div>

            </body>
            </html>
            """.formatted(token);
}
}
