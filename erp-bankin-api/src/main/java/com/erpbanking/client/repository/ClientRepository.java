package com.erpbanking.client.repository;

import com.erpbanking.client.entity.Client;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCinContainingIgnoreCase(
        String nom, String prenom, String telephone, String email, String cin
    );

    boolean existsByTelephone(String telephone);
    boolean existsByCin(String cin);
    boolean existsByEmail(String email);

    Optional<Client> findByCin(String cin);

    @Query("""
            SELECT c FROM Client c
            WHERE LOWER(CONCAT(c.prenom, ' ', c.nom)) = LOWER(:nomComplet)
               OR LOWER(CONCAT(c.nom, ' ', c.prenom)) = LOWER(:nomComplet)
            """)
    List<Client> findByNomComplet(@Param("nomComplet") String nomComplet);
}