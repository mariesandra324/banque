package com.erpbanking.guichet.repository;

import com.erpbanking.guichet.entity.Guichet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GuichetRepository extends JpaRepository<Guichet, Long> {

    Optional<Guichet> findByCodeGuichet(String codeGuichet);

    boolean existsByCodeGuichet(String codeGuichet);

    List<Guichet> findAllByOrderByCodeGuichetAsc();

    List<Guichet> findByActifTrueOrderByCodeGuichetAsc();

    @Query
    ("SELECT g FROM Guichet g WHERE g.id NOT IN (SELECT u.guichet.id FROM Utilisateur u WHERE u.guichet IS NOT NULL) AND g.actif = true ")
    List<Guichet> findGuichetsDisponibles();
}
