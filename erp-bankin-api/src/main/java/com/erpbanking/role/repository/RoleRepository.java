package com.erpbanking.role.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.erpbanking.role.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNom(String nom);

    boolean existsByNom(String nom);

}
