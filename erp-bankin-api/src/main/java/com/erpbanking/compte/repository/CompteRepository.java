package com.erpbanking.compte.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.erpbanking.compte.entity.Compte;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Long>{

    Optional<Compte> findByNumeroCompte(String numeroCompte);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Compte c where c.numeroCompte = :numeroCompte")
    Optional<Compte> findByNumeroCompteForUpdate(@Param("numeroCompte") String numeroCompte);

    long countByClientId(Long clientId);
    List<Compte> findByClientId(Long clientId);
}
    
