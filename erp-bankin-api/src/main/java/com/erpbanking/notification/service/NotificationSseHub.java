package com.erpbanking.notification.service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.erpbanking.notification.dto.NotificationResponse;

import lombok.RequiredArgsConstructor;

/**
 * Concentre les connexions SSE actives, indexées par destinataire :
 * <ul>
 *   <li>Staff : {@code email:<email>} (identité unique connectée)</li>
 *   <li>Client : {@code client:<clientId>}</li>
 * </ul>
 * Le broadcast d'un événement "notification" est poussé en temps réel
 * aux émetteurs concernés.
 */
@Component
@RequiredArgsConstructor
public class NotificationSseHub {

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> emitters =
            new ConcurrentHashMap<>();

    public void register(String key, SseEmitter emitter) {
        emitter.onCompletion(() -> unregister(key, emitter));
        emitter.onTimeout(() -> unregister(key, emitter));
        emitter.onError(e -> unregister(key, emitter));
        emitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(emitter);
    }

    public void unregister(String key, SseEmitter emitter) {
        emitters.computeIfPresent(key, (k, list) -> {
            list.remove(emitter);
            return list.isEmpty() ? null : list;
        });
    }

    public void broadcast(String key, NotificationResponse payload) {
        List<SseEmitter> list = emitters.get(key);
        if (list == null) {
            return;
        }
        for (SseEmitter emitter : list) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(payload, MediaType.APPLICATION_JSON)
                );
            } catch (Exception e) {
                list.remove(emitter);
            }
        }
    }

    /** Garde les connexions vivantes et purge les émetteurs morts. */
    @Scheduled(fixedRate = 15_000)
    public void heartbeat() {
        emitters.forEach((key, list) -> list.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (Exception e) {
                list.remove(emitter);
            }
        }));
    }
}