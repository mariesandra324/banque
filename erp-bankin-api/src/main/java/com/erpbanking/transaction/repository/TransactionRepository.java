package com.erpbanking.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.comptabilite.dto.RapportGuichetLigne;
import com.erpbanking.transaction.entity.Transaction;
import java.util.List;


/**
 * Categorie effective d'une transaction, en SQL.
 * Reproduit {@code RapportGuichetService.CATEGORIE_REMBOURSEMENT} : un remboursement
 * d'echeance est stocke comme un RETRAIT, on le reclasifie pour le rapport.
 */
final class CategoriesSql {

    private CategoriesSql() {
    }

    // Le motif s'arrete volontairement au mot "Remboursement" : la suite du
    // prefixe contient un accent ("Remboursement echeance") et un LIKE sans
    // diacritique ne correspondrait jamais.
    static final String CATEGORIE = "(CASE WHEN t.type = 'RETRAIT' "
            + "AND t.description LIKE 'Remboursement%' "
            + "THEN 'REMBOURSEMENT' ELSE t.type::text END)";
}

public interface TransactionRepository  extends JpaRepository<Transaction, Long>{
    @Query("SELECT DISTINCT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd WHERE cs.numeroCompte = :numeroCompte OR cd.numeroCompte = :numeroCompte ORDER BY t.dateTransaction DESC")
    List<Transaction> findByNumeroCompte(@Param("numeroCompte") String numeroCompte);

    @Query("SELECT DISTINCT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd ORDER BY t.dateTransaction DESC")
    List<Transaction> findAllWithAccountsOrderByDateTransactionDesc();

    Transaction findByReference(String reference);

    @Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.compteSource cs LEFT JOIN FETCH t.compteDestination cd WHERE (cs.client.id = :clientId OR cd.client.id = :clientId) ORDER BY t.dateTransaction DESC ")
    List<Transaction> findByClientId(@Param("clientId") Long clientId);

    // Rapport de guichet : agregation par periode et par guichet.
    // Les filtres annee/mois/jour sont optionnels (CAST(... AS INTEGER) IS NULL).
    // Les transactions sans guichet sont regroupees sous "NON RATTACHE" :
    // transactions historiques et mouvements automatiques de credit.
    //
    // Les remboursements d'echeance sont enregistres comme des RETRAIT dont la
    // description commence par le prefixe ci-dessous (MouvementCompteService).
    // Ils sont isoles dans total_remboursements ET exclus de total_retraits,
    // afin qu'un remboursement ne soit pas compte deux fois. Voir
    // RapportGuichetService.CATEGORIE_REMBOURSEMENT : si ce prefixe change,
    // la colonne remboursement du rapport devient silencieusement vide.
    //
    // Le filtre :categorie est applique sur la categorie effective de chaque
    // transaction, pas sur le type brut de la colonne.
    @Query(value = "SELECT "
            + "to_char(date_trunc(:granularite, t.date_transaction), :formatPeriode) AS periode, "
            + "COALESCE(g.code_guichet, 'NON RATTACHE') AS code_guichet, "
            + "COUNT(*) AS nombre_operations, "
            + "COALESCE(SUM(t.montant) FILTER (WHERE " + CategoriesSql.CATEGORIE + " = 'DEPOT'), 0) AS total_depots, "
            + "COALESCE(SUM(t.montant) FILTER (WHERE " + CategoriesSql.CATEGORIE + " = 'RETRAIT'), 0) AS total_retraits, "
            + "COALESCE(SUM(t.montant) FILTER (WHERE " + CategoriesSql.CATEGORIE + " = 'VIREMENT'), 0) AS total_virements, "
            + "COALESCE(SUM(t.montant) FILTER (WHERE " + CategoriesSql.CATEGORIE + " = 'REMBOURSEMENT'), 0) AS total_remboursements "
            + "FROM transactions t "
            + "LEFT JOIN guichets g ON g.id = t.guichet_id "
            + "WHERE t.statut = 'SUCCES' "
            + "AND (CAST(:annee AS INTEGER) IS NULL OR EXTRACT(YEAR FROM t.date_transaction) = CAST(:annee AS INTEGER)) "
            + "AND (CAST(:mois AS INTEGER) IS NULL OR EXTRACT(MONTH FROM t.date_transaction) = CAST(:mois AS INTEGER)) "
            + "AND (CAST(:jour AS INTEGER) IS NULL OR EXTRACT(DAY FROM t.date_transaction) = CAST(:jour AS INTEGER)) "
            + "AND (CAST(:codeGuichet AS TEXT) IS NULL "
            + "     OR COALESCE(g.code_guichet, 'NON RATTACHE') = CAST(:codeGuichet AS TEXT)) "
            + "AND (CAST(:categorie AS TEXT) IS NULL OR " + CategoriesSql.CATEGORIE + " = CAST(:categorie AS TEXT)) "
            + "GROUP BY 1, 2 "
            + "ORDER BY 1, 2", nativeQuery = true)
    List<RapportGuichetLigne> agregerParPeriodeEtGuichet(
            @Param("granularite") String granularite,
            @Param("formatPeriode") String formatPeriode,
            @Param("annee") Integer annee,
            @Param("mois") Integer mois,
            @Param("jour") Integer jour,
            @Param("codeGuichet") String codeGuichet,
            @Param("categorie") String categorie);
}
