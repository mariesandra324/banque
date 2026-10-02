package com.erpbanking.audit.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.audit.dto.AuditFiltresResponse;
import com.erpbanking.audit.dto.AuditPageResponse;
import com.erpbanking.audit.service.AuditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE','COMPTABLE')")
    public AuditPageResponse consulter(
            @RequestParam(required = false) Long utilisateurId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate depuis,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate jusqua,
            @RequestParam(required = false) String recherche,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int taille) {

        return auditService.consulter(
                utilisateurId,
                role,
                module,
                action,
                debut(depuis),
                fin(jusqua),
                recherche,
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(taille, 1), 200),
                        Sort.by(Sort.Order.desc("dateAction"), Sort.Order.desc("id"))));
    }

    @GetMapping("/filtres")
    @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE','COMPTABLE')")
    public AuditFiltresResponse filtres() {
        return auditService.filtres();
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','GESTIONNAIRE','COMPTABLE')")
    public ResponseEntity<String> exporter(
            @RequestParam(required = false) Long utilisateurId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate depuis,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate jusqua) {

        String csv = auditService.exporterCsv(
                utilisateurId, role, module, action, debut(depuis), fin(jusqua));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"journal-audit-" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    /** Une date "depuis" inclut toute la journée : on démarre à 00:00:00. */
    private LocalDateTime debut(LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    /** Une date "jusqua" inclut toute la journée : on termine à 23:59:59.999. */
    private LocalDateTime fin(LocalDate date) {
        return date == null ? null : LocalDateTime.of(date, LocalTime.MAX);
    }
}
