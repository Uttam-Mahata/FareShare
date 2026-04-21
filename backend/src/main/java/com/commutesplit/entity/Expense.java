package com.commutesplit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id
    @Column(columnDefinition = "uniqueidentifier")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ExpenseType type;

    @Column(length = 255)
    private String description;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "sync_id", nullable = false, unique = true, columnDefinition = "uniqueidentifier")
    private UUID syncId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum ExpenseType { BUS, LUNCH, CAB, OTHER }
}
