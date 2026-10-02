package com.erpbanking.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.notification.entity.DeviceToken;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findByClientId(Long clientId);

    List<DeviceToken> findByUtilisateurId(Long utilisateurId);

    Optional<DeviceToken> findByToken(String token);
}