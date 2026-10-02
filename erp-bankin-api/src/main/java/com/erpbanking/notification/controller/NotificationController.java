package com.erpbanking.notification.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.erpbanking.notification.dto.DeviceTokenRequest;
import com.erpbanking.notification.dto.NotificationPreferenceDto;
import com.erpbanking.notification.dto.NotificationResponse;
import com.erpbanking.notification.service.CurrentUserService;
import com.erpbanking.notification.service.CurrentUserService.IdentiteCourante;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.notification.service.NotificationSseHub;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationSseHub sseHub;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<NotificationResponse> lister() {
        return notificationService.listerPourCourant();
    }

    @GetMapping("/non-lues")
    public long compterNonLues() {
        return notificationService.compterNonLuesPourCourant();
    }

    @PutMapping("/{id}/lue")
    public void marquerLue(@PathVariable Long id) {
        notificationService.marquerLue(id);
    }

    @PutMapping("/lues")
    public void marquerToutesLues() {
        notificationService.marquerToutesLues();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            throw new RuntimeException("Utilisateur non authentifié.");
        }

        SseEmitter emitter = new SseEmitter(0L);

        if (identite.isClient()) {
            sseHub.register("client:" + identite.clientId(), emitter);
        } else if (identite.isStaff()) {
            sseHub.register("email:" + identite.email(), emitter);
        }

        return emitter;
    }

    @GetMapping("/preferences")
    public List<NotificationPreferenceDto> preferences() {
        return notificationService.preferencesPourCourant();
    }

    @PutMapping("/preferences")
    public void majPreferences(@RequestBody List<NotificationPreferenceDto> toggles) {
        notificationService.majPreferences(toggles);
    }

    @PostMapping("/device-token")
    public void enregistrerToken(@RequestBody DeviceTokenRequest request) {
        notificationService.enregistrerTokenClient(request.getToken(), request.getPlateforme());
    }

    @DeleteMapping("/device-token/{token}")
    public void supprimerToken(@PathVariable String token) {
        notificationService.supprimerToken(token);
    }
}