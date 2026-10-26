package com.erpbanking.role.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.erpbanking.permission.entity.Permission;
import com.erpbanking.role.dto.RoleRequest;
import com.erpbanking.role.dto.RoleResponse;
import com.erpbanking.role.entity.Role;

@Component
public class RoleMapper {
    private RoleMapper() {
    }

    public static Role toEntity(RoleRequest request) {

        return Role.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .actif(request.getActif() == null ? Boolean.TRUE : request.getActif())
                .build();

    }

    public static RoleResponse toResponse(Role role) {

        Set<Long> permissionIds = role.getPermissions() == null
                ? Set.of()
                : role.getPermissions().stream()
                        .map(Permission::getId)
                        .collect(Collectors.toSet());

        return RoleResponse.builder()
                .id(role.getId())
                .nom(role.getNom())
                .description(role.getDescription())
                .actif(role.getActif())
                .dateCreation(role.getDateCreation())
                .permissionIds(permissionIds)
                .build();

    }
}
