package com.erpbanking.client.dto;

import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private Long id;

    private String nom;

    private String prenom;

    private String cin;

    private String email;

    private String telephone;

    private String adresse;

    private LocalDate dateNaissance;

    private LocalDate dateCreation;
}
