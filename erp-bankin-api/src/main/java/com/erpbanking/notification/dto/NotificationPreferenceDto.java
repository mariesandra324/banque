package com.erpbanking.notification.dto;

import com.erpbanking.notification.entity.NotificationType;

import lombok.*;

/** Préférence (catalogue) d'un type de notification, avec les toggles actifs. */
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {

    private NotificationType type;
    private String libelle;
    private String emoji;
    private String roleCible;
    private boolean emailActive;
    private boolean pushActive;
}