package com.erpbanking.role.service;

import com.erpbanking.role.dto.RoleRequest;
import com.erpbanking.role.dto.RoleResponse;
import com.erpbanking.role.mapper.RoleMapper;
import com.erpbanking.role.repository.RoleRepository;
import com.erpbanking.permission.entity.Permission;
import com.erpbanking.permission.repository.PermissionRepository;
import com.erpbanking.role.entity.Role;
import com.erpbanking.common.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService{
    private final RoleRepository roleRepository;

    private final PermissionRepository permissionRepository;

    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request){


        if(roleRepository.existsByNom(request.getNom())){

            throw new RuntimeException(
                "Ce rôle existe déjà"
            );

        }


        Role role = RoleMapper.toEntity(request);

        role.setPermissions(chargerPermissions(request.getPermissionIds()));

        Role saved = roleRepository.save(role);


        return RoleMapper.toResponse(saved);

    }



    @Override
    public RoleResponse findById(Long id){


        Role role = roleRepository.findById(id)

                .orElseThrow(
                    () -> new ResourceNotFoundException(
                        "Rôle introuvable"
                    )
                );


        return RoleMapper.toResponse(role);

    }



    @Override
    public List<RoleResponse> findAll(){


        return roleRepository.findAll()
                .stream()
                .map(RoleMapper::toResponse)
                .toList();

    }



    @Override
    @Transactional
    public RoleResponse update(
            Long id,
            RoleRequest request
    ){

        Role role = roleRepository.findById(id)

                .orElseThrow(
                    () -> new ResourceNotFoundException(
                        "Rôle introuvable"
                    )
                );


        role.setNom(request.getNom());

        role.setDescription(
                request.getDescription()
        );

        if (request.getActif() != null) {
            role.setActif(request.getActif());
        }

        if (request.getPermissionIds() != null) {
            role.setPermissions(chargerPermissions(request.getPermissionIds()));
        }


        return RoleMapper.toResponse(
                roleRepository.save(role)
        );

    }




    @Override
    public void delete(Long id){


        Role role = roleRepository.findById(id)

                .orElseThrow(
                    () -> new ResourceNotFoundException(
                        "Rôle introuvable"
                    )
                );


        role.setActif(false);


        roleRepository.save(role);

    }

    private Set<Permission> chargerPermissions(Set<Long> permissionIds) {

        if (permissionIds == null || permissionIds.isEmpty()) {
            return new HashSet<>();
        }

        return new HashSet<>(permissionRepository.findAllById(permissionIds));
    }
}
