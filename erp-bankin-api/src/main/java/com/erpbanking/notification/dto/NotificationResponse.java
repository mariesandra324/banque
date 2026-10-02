package com.erpbanking.notification.dto;

import java.time.LocalDateTime;

import com.erpbanking.notification.entity.NotificationType;

import lombok.*;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String titre;
    private String message;
    private String lien;
    private boolean lu;
    private LocalDateTime dateCreation;
    private String emoji;
}