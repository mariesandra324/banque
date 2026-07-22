package com.erpbanking.transaction.entity;

import com.erpbanking.compte.entity.Compte;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTransaction type;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(nullable = false)
    private LocalDateTime dateTransaction;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTransaction statut;

    // Compte émetteur (pour dépôt, retrait ou virement)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_source_id", nullable = false)
    private Compte compteSource;

    // Compte destinataire (uniquement obligatoire en cas de VIREMENT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_destination_id")
    private Compte compteDestination;
}