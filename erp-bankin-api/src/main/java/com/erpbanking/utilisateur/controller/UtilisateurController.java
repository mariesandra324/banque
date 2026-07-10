package com.erpbanking.utilisateur.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.erpbanking.common.ApiResponse;
import com.erpbanking.utilisateur.dto.UtilisateurRequest;
import com.erpbanking.utilisateur.dto.UtilisateurResponse;
import com.erpbanking.utilisateur.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.*;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {
    private final UtilisateurService utilisateurService;

    @PostMapping
    public ResponseEntity<ApiResponse<UtilisateurResponse>> create(
            @Valid @RequestBody UtilisateurRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Utilisateur créé avec succès.",
                        utilisateurService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UtilisateurResponse>>> findAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste des utilisateurs.",
                        utilisateurService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur trouvé.",
                        utilisateurService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UtilisateurRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur modifié avec succès.",
                        utilisateurService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @PathVariable Long id) {

        utilisateurService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur désactivé avec succès.",
                        null));
    }
}
