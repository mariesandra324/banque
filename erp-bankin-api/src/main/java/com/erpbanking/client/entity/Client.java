package com.erpbanking.client.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private String nom;
    private String prenom;

    @Column( name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "telephone", nullable = false, unique = true)
    private String telephone;
    private String adresse;
    //private String cin;
    private LocalDate dateNaissance;
    private LocalDate dateCreation;
}
