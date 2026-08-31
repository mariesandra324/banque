package com.erpbanking.role.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.erpbanking.role.dto.RoleRequest;
import com.erpbanking.role.dto.RoleResponse;
import com.erpbanking.common.ApiResponse;
import com.erpbanking.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {
    private final RoleService roleService;




    // @PostMapping
    // public ResponseEntity<ApiResponse> create(
    //         @Valid @RequestBody RoleRequest request
    // ){

    //     return ResponseEntity
    //             .status(HttpStatus.CREATED)
    //             .body(
    //                 ApiResponse.success(
    //                     "Rôle créé avec succès",
    //                     roleService.create(request)
    //                 )
    //             );

    // }

    @PostMapping
        public ResponseEntity<RoleResponse> create(
                @Valid @RequestBody RoleRequest request
        ){

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(roleService.create(request));
        }



    // @GetMapping
    // public ResponseEntity<ApiResponse> findAll(){

    //     return ResponseEntity.ok(

    //         ApiResponse.success(
    //             "Liste des rôles",
    //             roleService.findAll()
    //         )

    //     );

    // }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> findAll(){

        return ResponseEntity.ok(
                roleService.findAll()
        );
    }




    // @GetMapping("/{id}")
    // public ResponseEntity<ApiResponse> findById(
    //         @PathVariable Long id
    // ){

    //     return ResponseEntity.ok(

    //         ApiResponse.success(
    //             "Rôle trouvé",
    //             roleService.findById(id)
    //         )

    //     );

    // }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> findById(
            @PathVariable Long id
    ){

        return ResponseEntity.ok(
                roleService.findById(id)
        );
    }


    // @PutMapping("/{id}")
    // public ResponseEntity<ApiResponse> update(
    //         @PathVariable Long id,
    //         @Valid @RequestBody RoleRequest request
    // ){

    //     return ResponseEntity.ok(

    //         ApiResponse.success(
    //             "Rôle modifié",
    //             roleService.update(id,request)
    //         )

    //     );

    // }
    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request
    ){

        return ResponseEntity.ok(
                roleService.update(id, request)
        );
    }




    // @DeleteMapping("/{id}")
    // public ResponseEntity<ApiResponse> delete(
    //         @PathVariable Long id
    // ){

    //     roleService.delete(id);


    //     return ResponseEntity.ok(

    //         ApiResponse.success(
    //             "Rôle désactivé",
    //             null
    //         )

    //     );

    // }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ){

        roleService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
