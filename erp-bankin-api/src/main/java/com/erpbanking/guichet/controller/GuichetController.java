package com.erpbanking.guichet.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.service.GuichetService;
import lombok.*;

@RestController
@RequestMapping("/api/guichets")
@RequiredArgsConstructor
public class GuichetController {
    private final GuichetService guichetService;

    @GetMapping("/disponibles")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Guichet>> getGuichetsDisponibles() {
        return ResponseEntity.ok(
            guichetService.findGuichetsDisponibles()
        );
    }
}
