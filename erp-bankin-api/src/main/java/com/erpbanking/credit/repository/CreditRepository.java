package com.erpbanking.credit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.StatutCredit;

public interface CreditRepository extends JpaRepository<Credit, Long >{
        Optional<Credit> findByNumeroCredit(String numeroCredit);
        List<Credit> findByClientId(Long clientId);
        Optional<Credit> findByOffreCreditId(Long offreCreditId);
        List<Credit> findByStatut(StatutCredit statut);
        Optional<Credit> findByDemandeCreditId(Long demandeCreditId);
        boolean existsByDemandeCreditId(Long demandeCreditId);
}
