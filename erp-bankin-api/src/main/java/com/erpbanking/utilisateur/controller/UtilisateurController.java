package com.erpbanking.utilisateur.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.erpbanking.common.ApiResponse;
import com.erpbanking.utilisateur.dto.ChangePasswordRequest;
import com.erpbanking.utilisateur.dto.OnCreate;
import com.erpbanking.utilisateur.dto.UpdateProfilRequest;
import com.erpbanking.utilisateur.dto.UtilisateurRequest;
import com.erpbanking.utilisateur.dto.UtilisateurResponse;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.*;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {
    private final UtilisateurService utilisateurService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> create(
            @Validated(OnCreate.class) @RequestBody UtilisateurRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Utilisateur créé avec succès.",
                        utilisateurService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UtilisateurResponse>>> findAll() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste des utilisateurs.",
                        utilisateurService.findAll()));
    }

    @PutMapping("/me/profil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> modifierProfil(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @Valid @RequestBody UpdateProfilRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profil modifié avec succès.",
                        utilisateurService.modifierProfil(utilisateur.getId(), request)));
    }

    @PutMapping("/me/mot-de-passe")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Object>> changerMotDePasse(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @Valid @RequestBody ChangePasswordRequest request) {

        utilisateurService.changerMotDePasse(utilisateur.getId(), request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Mot de passe modifié avec succès.",
                        null));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur trouvé.",
                        utilisateurService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<ApiResponse<UtilisateurResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UtilisateurRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur modifié avec succès.",
                        utilisateurService.update(id, request)));
    }

    @PatchMapping("/{id}/bloquer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> bloquer(
            @PathVariable Long id) {

        utilisateurService.bloquer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur bloqué et guichet libéré.",
                        null));
    }

    @PatchMapping("/{id}/debloquer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> debloquer(
            @PathVariable Long id) {

        utilisateurService.debloquer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur débloqué.",
                        null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(
            @PathVariable Long id) {

        utilisateurService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Utilisateur désactivé avec succès.",
                        null));
    }
}
