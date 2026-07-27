package com.erpbanking.compte.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.compte.entity.Compte;

@Component
public class CompteMapper {
    
    public Compte toEntity(CompteRequest request, String numeroCompte){

        return Compte.builder()
            .numeroCompte(numeroCompte)
            .typeCompte(request.getTypeCompte())
            .solde(request.getSolde() != null ? request.getSolde() : BigDecimal.ZERO)
            .statut(request.getStatut() != null && !request.getStatut().isBlank() ? request.getStatut() : "ACTIF")
            .dateCreation(LocalDate.now())
            .build();
    }

    public CompteResponse toResponse(Compte compte) {

    return CompteResponse.builder()
            .id(compte.getId())
            .numeroCompte(compte.getNumeroCompte())
            .typeCompte(compte.getTypeCompte())
            .solde(compte.getSolde())
            .dateCreation(compte.getDateCreation())
            .statut(compte.getStatut())
            .clientId(
                compte.getClient() != null 
                ? compte.getClient().getId() 
                : null
            )
            .build();
}
}
