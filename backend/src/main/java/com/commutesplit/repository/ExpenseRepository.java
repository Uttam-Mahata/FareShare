package com.commutesplit.repository;

import com.commutesplit.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Optional<Expense> findBySyncId(UUID syncId);

    @Query("SELECT e FROM Expense e JOIN FETCH e.payer WHERE e.group.id = :groupId AND e.updatedAt > :since ORDER BY e.updatedAt DESC")
    List<Expense> findByGroupIdAndUpdatedAtAfter(UUID groupId, Instant since);
}
