package com.erpbanking.caisse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutSessionCaisse;

public interface SessionCaisseRepository extends JpaRepository<SessionCaisse, Long> {
    Optional<SessionCaisse> findByAgentIdAndStatut(Long agentId, StatutSessionCaisse statut);
    Optional<SessionCaisse> findByGuichetIdAndStatut(Long guichetId, StatutSessionCaisse statut);
    List<SessionCaisse> findByGuichetIdOrderByDateOuvertureDesc(Long guichetId);
}
