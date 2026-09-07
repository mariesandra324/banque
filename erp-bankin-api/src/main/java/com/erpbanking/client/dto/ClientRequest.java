package com.erpbanking.client.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequest {

    private String nom;
    private String prenom;

    @NotBlank(message = "Le CIN est obligatoire.")
    @Size(min = 12, max = 12, message = "Le CIN doit contenir exactement 12 chiffres.")
    @Pattern(regexp = "\\d{12}", message = "Le CIN doit contenir uniquement des chiffres.")
    private String cin;

    private String email;

    @NotBlank(message = "Le téléphone est obligatoire.")
    @Pattern(regexp = "^\\+261(34|37|33|32|38|36)\\d{7}$", message = "Le téléphone doit être au format +26134xxxxxxx, +26137xxxxxxx, +26133xxxxxxx, +26132xxxxxxx ou +26138xxxxxxx.")
    private String telephone;
    private String adresse;
    private LocalDate dateNaissance;

    // Getters et Setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(LocalDate dateNaissance) {
        this.dateNaissance = dateNaissance;
    }
}
