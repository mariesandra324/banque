package com.erpbanking.utilisateur.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.erpbanking.permission.entity.Permission;

import com.erpbanking.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,length = 100)
    private String nom;

    @Column(nullable = false,length = 100)
    private String prenom;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Column(length = 20)
    private String telephone;

    @Builder.Default
    private Boolean actif = true;

    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id",nullable = false)
    private Role role;

    @Override
    public String getUsername() {
        return email;
    }


    @Override
    public String getPassword() {
        return motDePasse;
    }


    @Override
public Collection<? extends GrantedAuthority> getAuthorities() {

    List<GrantedAuthority> authorities = new ArrayList<>();

    authorities.add(
            new SimpleGrantedAuthority("ROLE_" + role.getNom())
    );

    if (role.getPermissions() != null) {

        for (Permission permission : role.getPermissions()) {

            System.out.println("Permission : " + permission);

            if (permission == null) {
                System.out.println("Permission NULL");
                continue;
            }

            System.out.println("Nom = " + permission.getNom());
            System.out.println("Actif = " + permission.getActif());

            if (Boolean.TRUE.equals(permission.getActif())
                    && permission.getNom() != null) {

                authorities.add(
                        new SimpleGrantedAuthority(permission.getNom())
                );
            }
        }
    }

    return authorities;
}


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }


    @Override
    public boolean isAccountNonLocked() {
        return true;
    }


    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @Override
    public boolean isEnabled() {
        return actif;
    }
}
