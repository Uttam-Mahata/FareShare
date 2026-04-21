package com.commutesplit.dto;

import com.commutesplit.entity.Expense.ExpenseType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SyncPushRequest(
    @NotNull List<ExpensePayload> expenses
) {
    public record ExpensePayload(
        @NotNull UUID syncId,
        @NotNull UUID groupId,
        @NotNull UUID payerId,
        @NotNull @Positive BigDecimal amount,
        @NotNull ExpenseType type,
        String description,
        @NotNull LocalDate expenseDate,
        @NotNull List<SplitPayload> splits
    ) {}

    public record SplitPayload(
        @NotNull UUID userId,
        @NotNull @Positive BigDecimal amountOwed
    ) {}
}
