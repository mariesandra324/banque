package com.erpbanking.notification.dto;

import lombok.*;

/** Corps de la requête d'enregistrement d'un jeton FCM (app mobile). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTokenRequest {

    private String token;
    private String plateforme;
}