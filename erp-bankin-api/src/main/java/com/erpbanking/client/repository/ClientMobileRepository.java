package com.erpbanking.client.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.client.entity.ClientMobile;

public interface ClientMobileRepository
        extends JpaRepository<ClientMobile, Long> {

    Optional<ClientMobile> findByIdentifiant(String identifiant);

    boolean existsByIdentifiant(String identifiant);

    boolean existsByClientId(Long clientId);

    Optional<ClientMobile> findByClientId(Long clientId);
}