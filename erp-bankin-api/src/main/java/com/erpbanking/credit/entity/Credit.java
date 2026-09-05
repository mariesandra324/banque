package com.erpbanking.credit.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.client.entity.Client;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "credits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique =true)
    private String numeroCredit;

    @Column(nullable = false,  precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false,  precision = 5, scale = 2)
    private BigDecimal tauxInteret;

    @Column(nullable = false)
    private Integer duree;

    @Column(nullable = false,  precision = 15, scale = 2)
    private BigDecimal mensualite;
    
    @Column(nullable = false)
    private LocalDateTime dateDebut;

    @Column(nullable = false,  precision = 15, scale = 2)
    private BigDecimal capitalRestant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCredit statut;

    @OneToOne
    @JoinColumn(name = "demande_credit_id", nullable = false, unique = true)
    private DemandeCredit demandeCredit;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToOne
    @JoinColumn(name = "offre_credit_id", unique = true)
    private OffreCredit offreCredit;

    
}
