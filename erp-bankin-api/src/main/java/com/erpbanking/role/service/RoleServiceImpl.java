package com.erpbanking.role.service;

import com.erpbanking.role.dto.RoleRequest;
import com.erpbanking.role.dto.RoleResponse;
import com.erpbanking.role.mapper.RoleMapper;
import com.erpbanking.role.repository.RoleRepository;
import com.erpbanking.role.entity.Role;
import com.erpbanking.common.*;
import org.springframework.stereotype.Service;
import java.util.List;
import lombok.*;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService{
    private final RoleRepository roleRepository;

    private final RoleMapper roleMapper;

    @Override
    public RoleResponse create(RoleRequest request){


        if(roleRepository.existsByNom(request.getNom())){

            throw new RuntimeException(
                "Ce rôle existe déjà"
            );

        }


        Role role = RoleMapper.toEntity(request);


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
}
