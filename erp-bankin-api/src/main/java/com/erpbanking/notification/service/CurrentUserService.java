package com.erpbanking.notification.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.utilisateur.entity.Utilisateur;

/**
 * Résout l'identité de l'utilisateur courant à partir du SecurityContext :
 * un membre du personnel (Utilisateur) ou un client (ClientUserDetails).
 */
@Service
public class CurrentUserService {

    public record IdentiteCourante(
            Long utilisateurId,
            String email,
            String roleNom,
            Long clientId
    ) {
        public boolean isClient() {
            return clientId != null;
        }

        public boolean isStaff() {
            return clientId == null && utilisateurId != null;
        }
    }

    public IdentiteCourante identite() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof ClientUserDetails clientUserDetails) {
            return new IdentiteCourante(
                    null,
                    clientUserDetails.getUsername(),
                    "CLIENT",
                    clientUserDetails.getClient().getId()
            );
        }

        if (principal instanceof Utilisateur utilisateur) {
            String roleNom = utilisateur.getRole() != null
                    ? utilisateur.getRole().getNom()
                    : null;
            return new IdentiteCourante(
                    utilisateur.getId(),
                    utilisateur.getEmail(),
                    roleNom,
                    null
            );
        }

        return null;
    }
}