package com.erpbanking.credit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.credit.entity.Echeance;

public interface EcheanceRepository extends JpaRepository<Echeance, Long> {

    List<Echeance> findByCreditIdOrderByNumeroEcheanceAsc(Long creditId);

    boolean existsByCreditId(Long creditId);
}