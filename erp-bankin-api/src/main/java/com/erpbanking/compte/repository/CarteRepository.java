package com.erpbanking.compte.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import com.erpbanking.compte.entity.Carte;

public interface CarteRepository  extends JpaRepository<Carte, Long>{
    Optional<Carte> findByNumeroCarte(String numeroCarte);

    Optional<Carte> findByCompteId(Long compteId);

    boolean existsByCompteId(Long compteId);

    @Query(" SELECT c FROM Carte c JOIN c.compte cp WHERE cp.client.id = :clientId ")
    List<Carte> findByClientId(@Param("clientId") Long clientId);
}
