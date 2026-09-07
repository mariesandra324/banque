package com.erpbanking.client.repository;

import com.erpbanking.client.entity.Client;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCinContainingIgnoreCase(
        String nom, String prenom, String telephone, String email, String cin
    );

    boolean existsByTelephone(String telephone);
    boolean existsByCin(String cin);
    boolean existsByEmail(String email);
}