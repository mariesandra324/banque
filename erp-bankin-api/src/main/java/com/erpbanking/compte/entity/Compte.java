package com.erpbanking.compte.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
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

    private String numeroCompte;

    private String typeCompte;

    private BigDecimal solde;

    private LocalDate dateCreation;

    private String statut;

    @ManyToOne
    @JoinColumn(name = "clientId")
    private Client client;

}
