package com.erpbanking.role.mapper;

import org.springframework.stereotype.Component;

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
                .build();

    }

    public static RoleResponse toResponse(Role role) {

        return RoleResponse.builder()
                .id(role.getId())
                .nom(role.getNom())
                .description(role.getDescription())
                .actif(role.getActif())
                .dateCreation(role.getDateCreation())
                .build();

    }
}
