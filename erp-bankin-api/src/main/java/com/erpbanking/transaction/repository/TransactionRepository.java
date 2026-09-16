package com.erpbanking.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.transaction.entity.Transaction;
import java.util.List;


public interface TransactionRepository  extends JpaRepository<Transaction, Long>{
    
    @Query("SELECT DISTINCT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd WHERE cs.numeroCompte = :numeroCompte OR cd.numeroCompte = :numeroCompte ORDER BY t.dateTransaction DESC")
    List<Transaction> findByNumeroCompte(@Param("numeroCompte") String numeroCompte);

    @Query("SELECT DISTINCT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd ORDER BY t.dateTransaction DESC")
    List<Transaction> findAllWithAccountsOrderByDateTransactionDesc();

    Transaction findByReference(String reference);

    @Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd WHERE (cs.client.id = :clientId OR cd.client.id = :clientId) ORDER BY t.dateTransaction DESC ")
    List<Transaction> findByClientId(@Param("clientId") Long clientId);
}
