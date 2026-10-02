package com.erpbanking.audit.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.erpbanking.audit.entity.AuditLog;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

@Repository
public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    /**
     * Construit la conjonction des filtres de l'ecran de consultation.
     *
     * <p>Les filtres sont traduits en {@link Predicate} plutot qu'en une
     * requete JPQL "{@code :param IS NULL OR ...}" : ce motif impose de
     * repeter chaque parametre, et Hibernate n'arrive alors plus a inferer
     * son type JDBC. Concretement, {@code LOWER(a.description) LIKE
     * LOWER(CONCAT('%', :recherche, '%'))} etait envoye en {@code bytea},
     * ce qui faisait echouer la requete avec
     * "la fonction lower(bytea) n'existe pas" (SQLState 42883).
     *
     * <p>Autre avantage : chaque filtre absent disparait reellement du SQL,
     * donc la clause WHERE reste exploitee par les index {@code idx_audit_log_*}
     * au lieu d'etre neutralisee par des OR sur valeurs nulles.
     */
    static Specification<AuditLog> filtres(Long utilisateurId,
                                           String role,
                                           String module,
                                           String action,
                                           LocalDateTime depuis,
                                           LocalDateTime jusqua,
                                           String recherche) {

        final String motif = (recherche == null || recherche.isBlank())
                ? null
                : "%" + echapper(recherche.trim().toLowerCase(Locale.FRANCE)) + "%";

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (utilisateurId != null) {
                predicates.add(criteriaBuilder.equal(root.get("utilisateur").get("id"), utilisateurId));
            }
            if (role != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), role));
            }
            if (module != null) {
                predicates.add(criteriaBuilder.equal(root.get("module"), module));
            }
            if (action != null) {
                predicates.add(criteriaBuilder.equal(root.get("action"), action));
            }
            if (depuis != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dateAction"), depuis));
            }
            if (jusqua != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dateAction"), jusqua));
            }
            if (motif != null) {
                predicates.add(criteriaBuilder.or(
                        likeInsensible(criteriaBuilder, root.get("description"), motif),
                        likeInsensible(criteriaBuilder, root.get("utilisateurNom"), motif),
                        likeInsensible(criteriaBuilder, root.get("entiteId"), motif)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * LIKE insensible a la casse : la colonne est mise en minuscules des deux
     * cotes pour rester compatible avec une collation Postgres non "C".
     * L'echappement protege les jokers {@code %} et {@code _} saisis par
     * l'utilisateur.
     */
    private static Predicate likeInsensible(CriteriaBuilder cb, Path<String> chemin, String motif) {
        return cb.like(cb.lower(chemin), motif, '\\');
    }

    /** Neutralise les jokers LIKE pour qu'ils soient cherches litteralement. */
    private static String echapper(String valeur) {
        return valeur.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    /** Listes de valeurs pour alimenter les menus deroulants des filtres. */
    @Query("SELECT DISTINCT a.role FROM AuditLog a WHERE a.role IS NOT NULL ORDER BY a.role")
    List<String> distinctRoles();

    @Query("SELECT DISTINCT a.module FROM AuditLog a ORDER BY a.module")
    List<String> distinctModules();

    @Query("SELECT DISTINCT a.action FROM AuditLog a ORDER BY a.action")
    List<String> distinctActions();

    @Query("""
            SELECT DISTINCT a.utilisateur.id FROM AuditLog a
            WHERE a.utilisateur IS NOT NULL ORDER BY a.utilisateur.id
            """)
    List<Long> distinctUtilisateurIds();
}
