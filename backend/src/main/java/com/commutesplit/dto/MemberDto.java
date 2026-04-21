package com.commutesplit.dto;

import java.util.UUID;

public record MemberDto(UUID userId, String name, String email) {}
