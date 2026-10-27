package com.erpbanking.caisse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.caisse.entity.ComptageCaisse;

public interface ComptageCaisseRepository extends JpaRepository<ComptageCaisse, Long> {
    List<ComptageCaisse> findByGuichetIdOrderByDateComptageDesc(Long guichetId);
    List<ComptageCaisse> findByAgentIdOrderByDateComptageDesc(Long agentId);
}
