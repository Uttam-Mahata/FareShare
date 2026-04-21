package com.commutesplit.dto;

import java.util.UUID;

public record AuthResponse(String token, UserDto user) {
    public record UserDto(UUID id, String name, String email) {}
}
