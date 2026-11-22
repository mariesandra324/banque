package com.erpbanking.guichet.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.guichet.dto.GuichetRequest;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.service.GuichetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guichets")
@RequiredArgsConstructor
public class GuichetController {

    private final GuichetService guichetService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<List<Guichet>> findAll() {
        return ResponseEntity.ok(guichetService.findAll());
    }

    @GetMapping("/disponibles")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<List<Guichet>> getGuichetsDisponibles() {
        return ResponseEntity.ok(guichetService.findGuichetsDisponibles());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Guichet> create(@Valid @RequestBody GuichetRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guichetService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Guichet> update(
            @PathVariable Long id,
            @Valid @RequestBody GuichetRequest request) {
        return ResponseEntity.ok(guichetService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        guichetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
