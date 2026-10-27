package com.erpbanking.caisse.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.utilisateur.entity.Utilisateur;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "demandes_transfert_coffre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeTransfertCoffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guichet_id", nullable = false)
    private Guichet guichet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_demandeur_id", nullable = false)
    private Utilisateur agentDemandeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gestionnaire_id")
    private Utilisateur gestionnaire;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal montant;

    @Column(length = 500)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutDemandeTransfert statut = StatutDemandeTransfert.EN_ATTENTE;

    @Column(name = "date_demande", nullable = false)
    @Builder.Default
    private LocalDateTime dateDemande = LocalDateTime.now();

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "motif_refus", length = 500)
    private String motifRefus;
}
