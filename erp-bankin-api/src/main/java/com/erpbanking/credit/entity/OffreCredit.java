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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "demande_credit_id", nullable = false)
    private DemandeCredit demandeCredit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "montant_propose", precision = 15, scale = 2, nullable = false)
    private BigDecimal montantPropose;

    @Column(name = "taux_interet", precision = 5, scale = 2, nullable = false)
    private BigDecimal tauxInteret;

    @Column(name = "duree", nullable = false)
    private Integer duree;

    @Column(name = "mensualite", precision = 15, scale = 2, nullable = false)
    private BigDecimal mensualite;

    @Column(name = "date_offre", nullable = false)
    private LocalDate dateOffre;

    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;

    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(name = "statut", nullable = false)
    private String statut;

    @Lob
    private byte[] pdfContent;
    
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
