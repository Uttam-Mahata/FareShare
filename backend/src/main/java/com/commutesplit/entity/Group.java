package com.commutesplit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "expense_groups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Group {
    @Id
    @Column(columnDefinition = "uniqueidentifier")
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "invite_code", nullable = false, unique = true, length = 6)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}
