package com.erpbanking.compte.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.erpbanking.compte.entity.Compte;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Long>{

    Optional<Compte> findByNumeroCompte(String numeroCompte);

    long countByClientId(Long clientId);
}
    

