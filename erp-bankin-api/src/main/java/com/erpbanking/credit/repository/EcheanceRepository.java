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

    boolean existsByCreditIdAndStatut(Long creditId, StatutEcheance statut);

    List<Echeance> findByDateEcheanceBetweenAndStatutNot(
            LocalDate debut, LocalDate fin, StatutEcheance statut);

    // Échéances échues (dateEcheance < date) encore dans le statut donné
    // (typiquement EN_ATTENTE) : sert à détecter les retards de paiement.
    // Jointure directe pour éviter le N+1 sur credit/client au moment du job.
    @Query("SELECT e FROM Echeance e "
            + "JOIN FETCH e.credit c "
            + "JOIN FETCH c.client "
            + "WHERE e.dateEcheance < :date "
            + "AND e.statut = :statut "
            + "ORDER BY e.dateEcheance ASC")
    List<Echeance> findEchuesParStatut(
            @Param("date") LocalDate date,
            @Param("statut") StatutEcheance statut);

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
