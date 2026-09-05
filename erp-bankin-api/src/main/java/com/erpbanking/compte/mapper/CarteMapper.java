package com.erpbanking.compte.mapper;

import org.springframework.stereotype.Component;

import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.entity.Carte;

@Component 
public class CarteMapper {
    public CarteResponse toResponse(Carte carte) {

        return CarteResponse.builder()
                .id(carte.getId())
                .numeroCarte(carte.getNumeroCarte())
                .dateExpiration(carte.getDateExpiration())
                .typeCarte(carte.getTypeCarte())
                .statut(carte.getStatut())
                .compteId(
                        carte.getCompte() != null
                                ? carte.getCompte().getId()
                                : null
                )
                .build();
    }
}
