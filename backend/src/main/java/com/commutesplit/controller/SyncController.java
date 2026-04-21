package com.commutesplit.controller;

import com.commutesplit.dto.*;
import com.commutesplit.service.SyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {
    private final SyncService syncService;

    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> push(@Valid @RequestBody SyncPushRequest req) {
        int synced = syncService.pushExpenses(req);
        return ResponseEntity.ok(Map.of("synced", synced, "status", "ok"));
    }

    @GetMapping("/pull")
    public ResponseEntity<SyncPullResponse> pull(
        @RequestParam UUID groupId,
        @RequestParam(defaultValue = "1970-01-01T00:00:00Z") String since
    ) {
        return ResponseEntity.ok(syncService.pullExpenses(groupId, Instant.parse(since)));
    }
}
