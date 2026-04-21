package com.commutesplit.dto;

import java.time.Instant;
import java.util.UUID;

public record GroupResponse(UUID id, String name, String inviteCode, Instant createdAt) {}
