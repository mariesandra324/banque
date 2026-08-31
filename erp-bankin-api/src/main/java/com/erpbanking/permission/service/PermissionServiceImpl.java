package com.erpbanking.permission.service;


import com.erpbanking.common.ResourceNotFoundException;
import com.erpbanking.permission.dto.PermissionRequest;
import com.erpbanking.permission.dto.PermissionResponse;
import com.erpbanking.permission.entity.Permission;
import com.erpbanking.permission.mapper.PermissionMapper;
import com.erpbanking.permission.repository.PermissionRepository;
import com.erpbanking.permission.service.PermissionService;
import org.springframework.stereotype.Service;
import com.erpbanking.common.*;
import lombok.RequiredArgsConstructor;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {


    private final PermissionRepository permissionRepository;


    @Override
    public PermissionResponse create(PermissionRequest request) {


        if(permissionRepository.existsByNom(request.getNom())){

            throw new RuntimeException(
                    "Cette permission existe déjà"
            );

        }


        Permission permission = PermissionMapper.toEntity(request);


        Permission saved = permissionRepository.save(permission);


        return PermissionMapper.toResponse(saved);

    }



    @Override
    public PermissionResponse findById(Long id) {


        Permission permission = permissionRepository.findById(id)

                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Permission introuvable"
                        )
                );


        return PermissionMapper.toResponse(permission);

    }




    @Override
    public List<PermissionResponse> findAll() {


        return permissionRepository.findAll()
                .stream()
                .map(PermissionMapper::toResponse)
                .toList();

    }





    @Override
    public PermissionResponse update(
            Long id,
            PermissionRequest request
    ) {


        Permission permission = permissionRepository.findById(id)

                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Permission introuvable"
                        )
                );


        permission.setNom(request.getNom());

        permission.setDescription(
                request.getDescription()
        );


        return PermissionMapper.toResponse(
                permissionRepository.save(permission)
        );

    }





    @Override
    public void delete(Long id) {


        Permission permission = permissionRepository.findById(id)

                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Permission introuvable"
                        )
                );


        permission.setActif(false);


        permissionRepository.save(permission);

    }

}