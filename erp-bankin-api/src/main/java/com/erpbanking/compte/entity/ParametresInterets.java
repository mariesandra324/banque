package com.erpbanking.compte.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "parametres_interets")
@Getter
@Setter
@NoArgsConstructor
public class ParametresInterets {

    @Id
    private Long id;

    @Column(name = "montant_courant", precision = 14, scale = 2, nullable = false)
    private BigDecimal montantCourant;

    @Column(name = "montant_epargne", precision = 14, scale = 2, nullable = false)
    private BigDecimal montantEpargne;
}
