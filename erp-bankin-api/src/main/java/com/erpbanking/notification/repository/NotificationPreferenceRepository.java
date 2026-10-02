package com.erpbanking.notification.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.notification.entity.NotificationPreference;
import com.erpbanking.notification.entity.NotificationType;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUtilisateurIdAndType(Long utilisateurId, NotificationType type);

    Optional<NotificationPreference> findByClientIdAndType(Long clientId, NotificationType type);
}