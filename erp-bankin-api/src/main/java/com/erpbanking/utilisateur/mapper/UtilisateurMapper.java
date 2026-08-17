package com.erpbanking.utilisateur.mapper;

import com.erpbanking.utilisateur.dto.UtilisateurResponse;
import com.erpbanking.utilisateur.entity.Utilisateur;

public class UtilisateurMapper {
    private UtilisateurMapper(){}

    public static UtilisateurResponse toResponse(Utilisateur utilisateur){

        return UtilisateurResponse.builder()

                .id(utilisateur.getId())

                .nom(utilisateur.getNom())

                .prenom(utilisateur.getPrenom())

                .email(utilisateur.getEmail())

                .telephone(utilisateur.getTelephone())

                .role(utilisateur.getRole().getNom())

                .codeGuichet(
                    utilisateur.getGuichet() != null
                    ? utilisateur.getGuichet().getCodeGuichet()
                    : null
                )

                .actif(utilisateur.getActif())
                
                .build();

    }
}
