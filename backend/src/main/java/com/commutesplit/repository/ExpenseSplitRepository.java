package com.commutesplit.repository;

import com.commutesplit.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {
    List<ExpenseSplit> findByExpenseId(UUID expenseId);

    @Query("SELECT es FROM ExpenseSplit es JOIN FETCH es.user WHERE es.expense.id IN :expenseIds")
    List<ExpenseSplit> findByExpenseIdIn(List<UUID> expenseIds);
}
