package com.erpbanking.credit.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "echeances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Echeance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer numeroEcheance;

    @Column(nullable = false)
    private LocalDate dateEcheance;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal capital;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal interet;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal capitalRestant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutEcheance statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_id", nullable = false)
    private Credit credit;
}