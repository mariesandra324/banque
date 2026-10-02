package com.erpbanking.utilisateur.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


import com.erpbanking.utilisateur.entity.Utilisateur;


public interface UtilisateurRepository extends JpaRepository<Utilisateur,Long>{

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);
    Optional<Utilisateur> findByCodePersonnel( String codePersonnel);

    List<Utilisateur> findByRole_Nom(String roleNom);
}
