package com.erpbanking.caisse.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.caisse.entity.DemandeTransfertCoffre;
import com.erpbanking.caisse.entity.StatutDemandeTransfert;

public interface DemandeTransfertCoffreRepository extends JpaRepository<DemandeTransfertCoffre, Long> {
    List<DemandeTransfertCoffre> findByAgentDemandeurIdOrderByDateDemandeDesc(Long agentId);
    List<DemandeTransfertCoffre> findByGuichetIdOrderByDateDemandeDesc(Long guichetId);
    List<DemandeTransfertCoffre> findByStatutOrderByDateDemandeDesc(StatutDemandeTransfert statut);

    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM DemandeTransfertCoffre d "
            + "WHERE d.guichet.id = :guichetId AND d.statut = :statut")
    BigDecimal totalTransfertsParGuichetEtStatut(
            @Param("guichetId") Long guichetId,
            @Param("statut") StatutDemandeTransfert statut);
}
