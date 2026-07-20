package com.erpbanking.client.repository;

import com.erpbanking.client.entity.Client;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String nom, String prenom, String telephone, String email
    );

    boolean existsByTelephone(String telephone);
}