package com.erpbanking.permission.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.erpbanking.permission.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByNom(String nom);

    boolean existsByNom(String nom);
    
}
