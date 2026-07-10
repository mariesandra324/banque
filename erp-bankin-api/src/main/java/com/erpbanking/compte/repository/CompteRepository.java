package com.erpbanking.compte.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.erpbanking.compte.entity.Compte;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Long>{

}
    

