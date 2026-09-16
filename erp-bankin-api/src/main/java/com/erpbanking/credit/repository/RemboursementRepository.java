package com.erpbanking.credit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.credit.entity.Remboursement;

public interface RemboursementRepository
        extends JpaRepository<Remboursement, Long> {

    List<Remboursement> findByCreditIdOrderByDateRemboursementDesc(Long creditId);

    List<Remboursement> findByEcheanceId(Long echeanceId);

    boolean existsByEcheanceId(Long echeanceId);
}