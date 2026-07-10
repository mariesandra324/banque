package com.erpbanking.utilisateur.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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

    @ManyToOne(fetch = FetchType.LAZY)
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

    return List.of(
        new SimpleGrantedAuthority(
            "ROLE_" + role.getNom()
        )
    );

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
