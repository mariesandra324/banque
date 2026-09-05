package com.erpbanking.compte.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.erpbanking.compte.entity.Carte;

public interface CarteRepository  extends JpaRepository<Carte, Long>{
    Optional<Carte> findByNumeroCarte(String numeroCarte);

    Optional<Carte> findByCompteId(Long compteId);

    boolean existsByCompteId(Long compteId);
}
