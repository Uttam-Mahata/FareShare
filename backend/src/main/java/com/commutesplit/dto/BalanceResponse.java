package com.commutesplit.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BalanceResponse(List<Balance> balances) {
    public record Balance(
        UUID fromUserId, String fromUserName,
        UUID toUserId, String toUserName,
        BigDecimal amount
    ) {}
}
