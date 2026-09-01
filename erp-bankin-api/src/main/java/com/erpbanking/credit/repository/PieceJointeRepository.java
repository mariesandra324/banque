package com.erpbanking.credit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.credit.entity.PieceJointe;

public interface PieceJointeRepository
        extends JpaRepository<PieceJointe, Long> {

    @Query("SELECT p FROM PieceJointe p WHERE p.demandeCredit.id = :demandeCreditId")
    List<PieceJointe> findByDemandeCreditId(@Param("demandeCreditId") Long demandeCreditId);
}