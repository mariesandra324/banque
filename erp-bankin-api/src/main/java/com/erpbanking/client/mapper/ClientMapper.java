package com.erpbanking.client.mapper;

import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.entity.Client;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ClientMapper {


    public Client toEntity(ClientRequest request) {

        return Client.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .cin(request.getCin())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .dateNaissance(request.getDateNaissance())
                .dateCreation(LocalDate.now())
                .build();
    }


    public ClientResponse toResponse(Client client) {

        return ClientResponse.builder()
                .id(client.getId())
                .nom(client.getNom())
                .prenom(client.getPrenom())
                .cin(client.getCin())
                .email(client.getEmail())
                .telephone(client.getTelephone())
                .adresse(client.getAdresse())
                .dateNaissance(client.getDateNaissance())
                .dateCreation(client.getDateCreation())
                .build();
    }
}