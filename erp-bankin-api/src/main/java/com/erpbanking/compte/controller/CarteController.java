package com.erpbanking.compte.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.compte.dto.CarteRequest;
import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.service.CarteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cartes")
@RequiredArgsConstructor
public class CarteController {
    private final CarteService carteService;

    @PostMapping
    public ResponseEntity<CarteResponse> create(
            @RequestBody CarteRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(carteService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CarteResponse>> findAll() {

        return ResponseEntity.ok(
                carteService.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarteResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                carteService.findById(id)
        );
    }

    @GetMapping("/compte/{compteId}")
    public ResponseEntity<CarteResponse> findByCompteId(
            @PathVariable Long compteId
    ) {

        return ResponseEntity.ok(
                carteService.findByCompteId(compteId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarteResponse> update(
            @PathVariable Long id,
            @RequestBody CarteRequest request
    ) {

        return ResponseEntity.ok(
                carteService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        carteService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
