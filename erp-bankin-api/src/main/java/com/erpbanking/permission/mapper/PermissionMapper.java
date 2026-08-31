package com.erpbanking.permission.mapper;

import com.erpbanking.permission.dto.PermissionRequest;
import com.erpbanking.permission.dto.PermissionResponse;
import com.erpbanking.permission.entity.Permission;

public class PermissionMapper {
    public static Permission toEntity(PermissionRequest request){

        return Permission.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .build();

    }

    public static PermissionResponse toResponse(Permission permission){

        return PermissionResponse.builder()
                .id(permission.getId())
                .nom(permission.getNom())
                .description(permission.getDescription())
                .actif(permission.getActif())
                .build();

    }
}
