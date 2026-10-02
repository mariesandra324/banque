package com.erpbanking.credit.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.StatutEcheance;

public interface EcheanceRepository extends JpaRepository<Echeance, Long> {

    List<Echeance> findByCreditIdOrderByNumeroEcheanceAsc(Long creditId);

    boolean existsByCreditId(Long creditId);

    List<Echeance> findByDateEcheanceBetweenAndStatutNot(
            LocalDate debut, LocalDate fin, StatutEcheance statut);

    // Échéancier global : jointure directe pour éviter le N+1 sur credit/client.
    @Query("SELECT e FROM Echeance e "
            + "JOIN FETCH e.credit c "
            + "JOIN FETCH c.client "
            + "ORDER BY e.dateEcheance ASC, c.numeroCredit ASC, e.numeroEcheance ASC")
    List<Echeance> findAllAvecCreditClient();

    @Query("SELECT e FROM Echeance e "
            + "JOIN FETCH e.credit c "
            + "JOIN FETCH c.client "
            + "WHERE e.statut = :statut "
            + "ORDER BY e.dateEcheance ASC, c.numeroCredit ASC, e.numeroEcheance ASC")
    List<Echeance> findTousAvecCreditClientParStatut(@Param("statut") StatutEcheance statut);
}
