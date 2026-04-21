package com.commutesplit.dto;

import com.commutesplit.entity.Expense.ExpenseType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SyncPullResponse(List<ExpenseDto> expenses, Instant pulledAt) {
    public record ExpenseDto(
        UUID id, UUID syncId, UUID groupId, UUID payerId, String payerName,
        BigDecimal amount, ExpenseType type, String description,
        LocalDate expenseDate, Instant createdAt, Instant updatedAt,
        List<SplitDto> splits
    ) {}

    public record SplitDto(UUID userId, String userName, BigDecimal amountOwed) {}
}
