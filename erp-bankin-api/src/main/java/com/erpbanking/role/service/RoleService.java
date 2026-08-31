package com.erpbanking.role.service;

import com.erpbanking.role.dto.RoleRequest;
import com.erpbanking.role.dto.RoleResponse;
import java.util.List;

public interface RoleService {

    
RoleResponse create(RoleRequest request);

    RoleResponse findById(Long id);

    List<RoleResponse> findAll();

    RoleResponse update(
            Long id,
            RoleRequest request
    );

    void delete(Long id);
}
