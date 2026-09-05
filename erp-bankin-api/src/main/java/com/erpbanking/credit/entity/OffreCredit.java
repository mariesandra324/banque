package com.erpbanking.credit.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.erpbanking.client.entity.Client;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "offres_credit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffreCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_offre", unique = true, nullable = false)
    private String numeroOffre;

    /**
     * Demande de crédit à l'origine de l'offre
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "demande_credit_id", nullable = false)
    private DemandeCredit demandeCredit;

    /**
     * Client concerné par l'offre
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    /**
     * Montant finalement proposé par la banque
     */
    @Column(name = "montant_propose", precision = 15, scale = 2, nullable = false)
    private BigDecimal montantPropose;

    /**
     * Taux d'intérêt proposé
     */
    @Column(name = "taux_interet", precision = 5, scale = 2, nullable = false)
    private BigDecimal tauxInteret;

    /**
     * Durée en mois
     */
    @Column(name = "duree", nullable = false)
    private Integer duree;

    /**
     * Mensualité proposée
     */
    @Column(name = "mensualite", precision = 15, scale = 2, nullable = false)
    private BigDecimal mensualite;

    /**
     * Date de création de l'offre
     */
    @Column(name = "date_offre", nullable = false)
    private LocalDate dateOffre;

    /**
     * Date limite de validité de l'offre
     */
    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    /**
     * Conditions particulières de l'offre
     */
    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;

    @Column(nullable = false, unique = true)
    private String token;
    /**
     * Statut de l'offre :
     * EN_ATTENTE, ACCEPTEE, REFUSEE, EXPIREE
     */
    @Column(name = "statut", nullable = false)
    private String statut;

    @Lob
    private byte[] pdfContent;
    /**
     * Génère automatiquement le numéro de l'offre.
     */
    public void genererNumeroOffre() {
        if (this.numeroOffre == null || this.numeroOffre.isBlank()) {
            this.numeroOffre = "OFF-" +
                    LocalDate.now().getYear() +
                    "-" +
                    UUID.randomUUID()
                         .toString()
                         .substring(0, 8)
                         .toUpperCase();
        }
    }
    
}
