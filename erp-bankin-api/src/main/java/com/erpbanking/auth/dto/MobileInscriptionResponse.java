package com.erpbanking.auth.dto;

import com.erpbanking.client.entity.StatutMobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MobileInscriptionResponse {

    private String message;

    private StatutMobile statut;
}
