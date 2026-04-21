package com.commutesplit.dto;

import jakarta.validation.constraints.*;

public record JoinGroupRequest(@NotBlank @Size(min = 6, max = 6) String inviteCode) {}
