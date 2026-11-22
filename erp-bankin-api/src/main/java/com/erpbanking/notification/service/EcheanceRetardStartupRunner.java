package com.erpbanking.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EcheanceRetardStartupRunner {

    private final EcheanceRetardJob echeanceRetardJob;

    @EventListener(ApplicationReadyEvent.class)
    public void rattraperEcheancesAuDemarrage() {
        echeanceRetardJob.detecterEcheancesEnRetard();
    }
}
