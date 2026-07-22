package com.erpbanking.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.transaction.entity.Transaction;
import java.util.List;


public interface TransactionRepository  extends JpaRepository<Transaction, Long>{
    
    @Query ("SELECT t FROM Transaction t where t.compteSource.numeroCompte =:numeroCompte OR t.compteDestination.numeroCompte =:numeroCompte ORDER BY t.dateTransaction DESC")
    List<Transaction> findByNumeroCompte (@Param("numeroCompte") String numeroCompte);

    Transaction findByReference(String reference);
}
