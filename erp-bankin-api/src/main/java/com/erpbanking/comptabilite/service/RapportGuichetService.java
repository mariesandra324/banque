package com.erpbanking.comptabilite.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.comptabilite.dto.RapportGuichetLigne;
import com.erpbanking.comptabilite.dto.RapportGuichetResponse;
import com.erpbanking.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RapportGuichetService {

    /** Granularités d'agrégation, alignées sur date_trunc de PostgreSQL. */
    public enum Granularite {
        JOUR("day", "DD/MM/YYYY"),
        MOIS("month", "MM/YYYY"),
        ANNEE("year", "YYYY");

        private final String dateTrunc;
        private final String format;

        Granularite(String dateTrunc, String format) {
            this.dateTrunc = dateTrunc;
            this.format = format;
        }

        public String getDateTrunc() {
            return dateTrunc;
        }

        public String getFormat() {
            return format;
        }

        public static Granularite depuis(String valeur) {
            if (valeur == null) {
                return ANNEE;
            }
            try {
                return valueOf(valeur.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                return ANNEE;
            }
        }
    }

    /**
     * Préfixe de description porté par les transactions de remboursement
     * d'échéance. Doit rester synchronisé avec la chaîne construite dans
     * {@code MouvementCompteService.debiterClient} (via RemboursementService).
     * Une divergence ne provoque aucune erreur : la colonne « remboursement »
     * du rapport devient simplement vide.
     */
    public static final String CATEGORIE_REMBOURSEMENT = "Remboursement";

    /**
     * Catégories de rapport. Elles ne modifient pas {@code TypeTransaction} :
     * DEPOT, RETRAIT et VIREMENT reprennent les types existants, et
     * REMBOURSEMENT est une vue sur les RETRAIT d'échéance.
     */
    public enum Categorie {
        DEPOT,
        RETRAIT,
        VIREMENT,
        REMBOURSEMENT;

        public static Categorie depuis(String valeur) {
            if (valeur == null || valeur.isBlank() || "TOUS".equalsIgnoreCase(valeur)) {
                return null;
            }
            try {
                return valueOf(valeur.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
    }

    private final TransactionRepository transactionRepository;

    /**
     * Agrège les transactions réussies par période et par guichet.
     * Les paramètres de période et de catégorie sont optionnels : null = pas de filtre.
     */
    @Transactional(readOnly = true)
    public List<RapportGuichetResponse> getRapport(
            Granularite granularite, Integer annee, Integer mois, Integer jour,
            String codeGuichet, Categorie categorie) {

        List<RapportGuichetLigne> lignes = transactionRepository.agregerParPeriodeEtGuichet(
                granularite.getDateTrunc(),
                granularite.getFormat(),
                annee,
                mois,
                jour,
                codeGuichet,
                categorie == null ? null : categorie.name());

        return lignes.stream()
                .map(RapportGuichetService::toResponse)
                .toList();
    }

    /**
     * Guichets proposés dans le filtre : ceux qui figurent dans le rapport,
     * plus la mention des transactions non rattachées.
     */
    @Transactional(readOnly = true)
    public List<String> getGuichetsDisponibles() {
        return transactionRepository.agregerParPeriodeEtGuichet(
                        Granularite.ANNEE.getDateTrunc(),
                        Granularite.ANNEE.getFormat(),
                        null, null, null, null, null)
                .stream()
                .map(RapportGuichetLigne::getCodeGuichet)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    private static RapportGuichetResponse toResponse(RapportGuichetLigne ligne) {
        return RapportGuichetResponse.builder()
                .periode(ligne.getPeriode())
                .codeGuichet(ligne.getCodeGuichet())
                .nombreOperations(ligne.getNombreOperations())
                .totalDepots(valeur(ligne.getTotalDepots()))
                .totalRetraits(valeur(ligne.getTotalRetraits()))
                .totalVirements(valeur(ligne.getTotalVirements()))
                .totalRemboursements(valeur(ligne.getTotalRemboursements()))
                .build();
    }

    private static BigDecimal valeur(BigDecimal montant) {
        return montant == null ? BigDecimal.ZERO : montant;
    }
}
