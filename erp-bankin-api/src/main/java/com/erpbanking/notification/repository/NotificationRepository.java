package com.erpbanking.notification.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erpbanking.notification.entity.Notification;
import com.erpbanking.notification.entity.NotificationType;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    boolean existsByClientIdAndTypeAndLien(Long clientId, NotificationType type, String lien);

    @Query("""
            SELECT n FROM Notification n
            WHERE (n.roleNom IN :roles OR n.utilisateurId = :utilisateurId)
            ORDER BY n.dateCreation DESC
            """)
    List<Notification> findPourUtilisateur(
            @Param("roles") Collection<String> roles,
            @Param("utilisateurId") Long utilisateurId,
            Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.clientId = :clientId
            ORDER BY n.dateCreation DESC
            """)
    List<Notification> findPourClient(
            @Param("clientId") Long clientId,
            Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE (n.roleNom IN :roles OR n.utilisateurId = :utilisateurId)
              AND n.lu = false
            ORDER BY n.dateCreation DESC
            """)
    List<Notification> findNonLuesUtilisateur(
            @Param("roles") Collection<String> roles,
            @Param("utilisateurId") Long utilisateurId,
            Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.clientId = :clientId
              AND n.lu = false
            ORDER BY n.dateCreation DESC
            """)
    List<Notification> findNonLuesClient(
            @Param("clientId") Long clientId,
            Pageable pageable);
}