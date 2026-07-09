package com.erpbanking.client.dto;

import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequest {
     private String nom;

    private String prenom;

    private String email;

    private String telephone;

    private String adresse;

    private LocalDate dateNaissance;
}
