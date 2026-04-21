package com.commutesplit.controller;

import com.commutesplit.dto.*;
import com.commutesplit.entity.User;
import com.commutesplit.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;
    private final BalanceService balanceService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
        @Valid @RequestBody CreateGroupRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(groupService.createGroup(req.name(), user));
    }

    @PostMapping("/join")
    public ResponseEntity<GroupResponse> joinGroup(
        @Valid @RequestBody JoinGroupRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(groupService.joinGroup(req.inviteCode(), user));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberDto>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getMembers(id));
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<BalanceResponse> getBalances(@PathVariable UUID id) {
        return ResponseEntity.ok(balanceService.computeBalances(id));
    }
}
