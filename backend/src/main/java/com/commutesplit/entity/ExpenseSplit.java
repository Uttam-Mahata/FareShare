package com.commutesplit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "expense_splits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseSplit {
    @Id
    @Column(columnDefinition = "uniqueidentifier")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount_owed", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountOwed;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }
}
