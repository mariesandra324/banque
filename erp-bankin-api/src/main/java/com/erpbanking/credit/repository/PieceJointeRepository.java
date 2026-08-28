package com.erpbanking.credit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.erpbanking.credit.entity.PieceJointe;

public interface PieceJointeRepository
        extends JpaRepository<PieceJointe, Long> {

    List<PieceJointe> findByDemandeCreditId(Long demandeCreditId);
}