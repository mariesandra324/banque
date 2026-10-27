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
@Table(name = "sessions_caisse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionCaisse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guichet_id", nullable = false)
    private Guichet guichet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Utilisateur agent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutSessionCaisse statut = StatutSessionCaisse.OUVERT;

    @Column(name = "solde_ouverture", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal soldeOuverture = BigDecimal.ZERO;

    @Column(name = "solde_theorique", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal soldeTheorique = BigDecimal.ZERO;

    @Column(name = "solde_fermeture", precision = 19, scale = 2)
    private BigDecimal soldeFermeture;

    @Column(name = "date_ouverture", nullable = false)
    @Builder.Default
    private LocalDateTime dateOuverture = LocalDateTime.now();

    @Column(name = "date_fermeture")
    private LocalDateTime dateFermeture;

    @Column(length = 500)
    private String observation;
}
