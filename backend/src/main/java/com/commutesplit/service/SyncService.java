package com.commutesplit.service;

import com.commutesplit.dto.*;
import com.commutesplit.entity.*;
import com.commutesplit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SyncService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional
    public int pushExpenses(SyncPushRequest req) {
        int count = 0;
        for (SyncPushRequest.ExpensePayload ep : req.expenses()) {
            if (expenseRepository.findBySyncId(ep.syncId()).isPresent()) continue;

            Group group = groupRepository.findById(ep.groupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found: " + ep.groupId()));
            User payer = userRepository.findById(ep.payerId())
                .orElseThrow(() -> new IllegalArgumentException("Payer not found: " + ep.payerId()));

            Expense expense = Expense.builder()
                .group(group).payer(payer)
                .amount(ep.amount()).type(ep.type())
                .description(ep.description())
                .expenseDate(ep.expenseDate())
                .syncId(ep.syncId())
                .build();
            expense = expenseRepository.save(expense);

            for (SyncPushRequest.SplitPayload sp : ep.splits()) {
                User splitUser = userRepository.findById(sp.userId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + sp.userId()));
                splitRepository.save(ExpenseSplit.builder()
                    .expense(expense).user(splitUser).amountOwed(sp.amountOwed()).build());
            }
            count++;
        }
        return count;
    }

    public SyncPullResponse pullExpenses(UUID groupId, Instant since) {
        List<Expense> expenses = expenseRepository.findByGroupIdAndUpdatedAtAfter(groupId, since);
        List<UUID> ids = expenses.stream().map(Expense::getId).toList();

        Map<UUID, List<ExpenseSplit>> splitsMap = new HashMap<>();
        if (!ids.isEmpty()) {
            splitRepository.findByExpenseIdIn(ids)
                .forEach(s -> splitsMap.computeIfAbsent(s.getExpense().getId(), k -> new ArrayList<>()).add(s));
        }

        List<SyncPullResponse.ExpenseDto> dtos = expenses.stream().map(e -> {
            List<SyncPullResponse.SplitDto> splitDtos = splitsMap.getOrDefault(e.getId(), List.of())
                .stream().map(s -> new SyncPullResponse.SplitDto(
                    s.getUser().getId(), s.getUser().getName(), s.getAmountOwed()
                )).toList();
            return new SyncPullResponse.ExpenseDto(
                e.getId(), e.getSyncId(), e.getGroup().getId(),
                e.getPayer().getId(), e.getPayer().getName(),
                e.getAmount(), e.getType(), e.getDescription(),
                e.getExpenseDate(), e.getCreatedAt(), e.getUpdatedAt(), splitDtos
            );
        }).toList();

        return new SyncPullResponse(dtos, Instant.now());
    }
}
