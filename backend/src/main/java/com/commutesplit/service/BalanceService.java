package com.commutesplit.service;

import com.commutesplit.dto.BalanceResponse;
import com.commutesplit.entity.*;
import com.commutesplit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BalanceService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final GroupMemberRepository groupMemberRepository;

    public BalanceResponse computeBalances(UUID groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupIdWithUser(groupId);
        Map<UUID, String> nameMap = new HashMap<>();
        members.forEach(m -> nameMap.put(m.getUser().getId(), m.getUser().getName()));

        // net[creditor][debtor] = amount debtor owes creditor
        Map<UUID, Map<UUID, BigDecimal>> net = new HashMap<>();
        members.forEach(m -> net.put(m.getUser().getId(), new HashMap<>()));

        List<Expense> expenses = expenseRepository.findByGroupIdAndUpdatedAtAfter(groupId, Instant.EPOCH);
        for (Expense e : expenses) {
            UUID payerId = e.getPayer().getId();
            List<ExpenseSplit> splits = splitRepository.findByExpenseId(e.getId());
            for (ExpenseSplit s : splits) {
                UUID debtorId = s.getUser().getId();
                if (debtorId.equals(payerId)) continue;
                net.computeIfAbsent(payerId, k -> new HashMap<>())
                    .merge(debtorId, s.getAmountOwed(), BigDecimal::add);
            }
        }

        List<BalanceResponse.Balance> result = new ArrayList<>();
        net.forEach((creditor, debtors) -> debtors.forEach((debtor, amount) -> {
            if (amount.compareTo(BigDecimal.ZERO) > 0) {
                result.add(new BalanceResponse.Balance(
                    debtor, nameMap.getOrDefault(debtor, "Unknown"),
                    creditor, nameMap.getOrDefault(creditor, "Unknown"),
                    amount
                ));
            }
        }));
        return new BalanceResponse(result);
    }
}
