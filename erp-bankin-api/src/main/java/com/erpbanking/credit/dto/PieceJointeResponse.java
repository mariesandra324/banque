package com.erpbanking.credit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PieceJointeResponse {
    private Long id;
    private String nomFichier;
    private String typeFichier;
    private String cheminFichier;
}
