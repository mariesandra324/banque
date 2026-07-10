package com.erpbanking.permission.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.erpbanking.permission.dto.PermissionRequest;
import com.erpbanking.permission.dto.PermissionResponse;
import com.erpbanking.permission.service.PermissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {


    private final PermissionService permissionService;


    @PostMapping
    public ResponseEntity<PermissionResponse> create(
            @Valid @RequestBody PermissionRequest request
    ){

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(permissionService.create(request));

    }


    @GetMapping
    public ResponseEntity<List<PermissionResponse>> findAll(){

        return ResponseEntity.ok(
                permissionService.findAll()
        );

    }


    @GetMapping("/{id}")
    public ResponseEntity<PermissionResponse> findById(
            @PathVariable Long id
    ){

        return ResponseEntity.ok(
                permissionService.findById(id)
        );

    }


    @PutMapping("/{id}")
    public ResponseEntity<PermissionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PermissionRequest request
    ){

        return ResponseEntity.ok(
                permissionService.update(id, request)
        );

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ){

        permissionService.delete(id);

        return ResponseEntity.noContent().build();

    }

}