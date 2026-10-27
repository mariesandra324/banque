package com.erpbanking.caisse.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.utilisateur.entity.Utilisateur;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "comptages_caisse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComptageCaisse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_caisse_id")
    private SessionCaisse sessionCaisse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guichet_id", nullable = false)
    private Guichet guichet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Utilisateur agent;

    @Column(name = "montant_theorique", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal montantTheorique = BigDecimal.ZERO;

    @Column(name = "montant_physique", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal montantPhysique = BigDecimal.ZERO;

    @Column(name = "ecart", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal ecart = BigDecimal.ZERO;

    @Column(name = "billets_10000")
    @Builder.Default
    private Integer billets10000 = 0;

    @Column(name = "billets_5000")
    @Builder.Default
    private Integer billets5000 = 0;

    @Column(name = "billets_2000")
    @Builder.Default
    private Integer billets2000 = 0;

    @Column(name = "billets_1000")
    @Builder.Default
    private Integer billets1000 = 0;

    @Column(name = "pieces_500")
    @Builder.Default
    private Integer pieces500 = 0;

    @Column(name = "pieces_200")
    @Builder.Default
    private Integer pieces200 = 0;

    @Column(name = "pieces_100")
    @Builder.Default
    private Integer pieces100 = 0;

    @Column(name = "pieces_50")
    @Builder.Default
    private Integer pieces50 = 0;

    @Column(name = "pieces_20")
    @Builder.Default
    private Integer pieces20 = 0;

    @Column(name = "pieces_10")
    @Builder.Default
    private Integer pieces10 = 0;

    @Column(name = "pieces_5")
    @Builder.Default
    private Integer pieces5 = 0;

    @Column(name = "pieces_1")
    @Builder.Default
    private Integer pieces1 = 0;

    @Column(name = "date_comptage", nullable = false)
    @Builder.Default
    private LocalDateTime dateComptage = LocalDateTime.now();

    @Column(length = 500)
    private String observation;
}
