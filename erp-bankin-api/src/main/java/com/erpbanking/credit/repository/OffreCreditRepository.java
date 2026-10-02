package com.erpbanking.credit.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.erpbanking.credit.entity.OffreCredit;

@Repository
public interface OffreCreditRepository extends JpaRepository<OffreCredit, Long> {

    Optional<OffreCredit> findByNumeroOffre(String numeroOffre);

    List<OffreCredit> findByDemandeCreditId(Long demandeCreditId);

    List<OffreCredit> findByClientId(Long clientId);

    List<OffreCredit> findByStatut(String statut);

    boolean existsByDemandeCreditId(Long demandeCreditId);

    boolean existsByDemandeCreditIdAndStatutIn(
            Long demandeCreditId,
            Collection<String> statuts
    );

    Optional<OffreCredit> findByToken(String token);
}
