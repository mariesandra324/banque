package com.erpbanking.caisse.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutSessionCaisse;

public interface SessionCaisseRepository extends JpaRepository<SessionCaisse, Long> {
    Optional<SessionCaisse> findByAgentIdAndStatut(Long agentId, StatutSessionCaisse statut);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SessionCaisse s WHERE s.agent.id = :agentId AND s.statut = :statut")
    Optional<SessionCaisse> findByAgentIdAndStatutForUpdate(
            @Param("agentId") Long agentId,
            @Param("statut") StatutSessionCaisse statut);
    Optional<SessionCaisse> findByGuichetIdAndStatut(Long guichetId, StatutSessionCaisse statut);
    List<SessionCaisse> findByGuichetIdOrderByDateOuvertureDesc(Long guichetId);
    List<SessionCaisse> findByStatutOrderByDateFermetureDesc(StatutSessionCaisse statut);
}
