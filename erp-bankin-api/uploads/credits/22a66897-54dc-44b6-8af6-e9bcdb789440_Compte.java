package com.erpbanking.compte.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import com.erpbanking.client.entity.Client;

@Entity
@Table(name="comptes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compte {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_compte", unique = true, nullable = false)
    private String numeroCompte;

    private String typeCompte;

    private BigDecimal solde;

    private LocalDate dateCreation;

    private String statut;

    @Column(name = "code_banque", nullable = false, length = 5)
    private String codeBanque;

    @Column(name = "code_guichet", nullable = false, length = 5)
    private String codeGuichet;

    @Column(name = "cle_rib", nullable = false, length = 2)
    private String cleRib;

    @Column(nullable = true, length = 27)
    private String iban;

    @ManyToOne
    @JoinColumn(name = "clientId")
    private Client client;

    @OneToOne(mappedBy = "compte")
    private Carte carte;
}
