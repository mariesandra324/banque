package com.erpbanking.client.dto;

import java.time.LocalDateTime;

import com.erpbanking.client.entity.StatutMobile;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClientMobileResponse {

    private Long id;

    private Long clientId;

    private String clientNom;

    private String clientPrenom;

    private String clientCin;

    private String clientEmail;

    private String identifiant;

    private StatutMobile statut;

    private Double revenu;

    private LocalDateTime dateInscription;

    private LocalDateTime dateValidation;

    private LocalDateTime derniereConnexion;
}