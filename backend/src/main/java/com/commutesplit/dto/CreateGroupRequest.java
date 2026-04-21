package com.commutesplit.dto;

import jakarta.validation.constraints.*;

public record CreateGroupRequest(@NotBlank @Size(min = 2, max = 100) String name) {}
