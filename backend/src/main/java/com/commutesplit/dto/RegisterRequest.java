package com.commutesplit.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 100) String password
) {}
