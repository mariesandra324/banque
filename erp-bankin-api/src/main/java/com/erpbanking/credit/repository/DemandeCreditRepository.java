package com.erpbanking.credit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;

public interface DemandeCreditRepository extends JpaRepository<DemandeCredit, Long> {
    List<DemandeCredit> findByClientId(Long clientId);
    List<DemandeCredit> findByStatut(StatutDemandeCredit statut);
}
