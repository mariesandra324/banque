package com.erpbanking.permission.service;

import com.erpbanking.permission.dto.PermissionRequest;
import com.erpbanking.permission.dto.PermissionResponse;

import java.util.List;

public interface PermissionService {

    PermissionResponse create(PermissionRequest request);

    PermissionResponse findById(Long id);

    List<PermissionResponse> findAll();

    PermissionResponse update(Long id, PermissionRequest request);

    void delete(Long id);

}