package com.commutesplit.service;

import com.commutesplit.dto.*;
import com.commutesplit.entity.*;
import com.commutesplit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public GroupResponse createGroup(String name, User creator) {
        String code;
        do {
            code = generateCode();
        } while (groupRepository.findByInviteCode(code).isPresent());

        Group group = Group.builder()
            .name(name)
            .inviteCode(code)
            .createdBy(creator)
            .build();
        group = groupRepository.save(group);

        groupMemberRepository.save(GroupMember.builder().group(group).user(creator).build());
        return new GroupResponse(group.getId(), group.getName(), group.getInviteCode(), group.getCreatedAt());
    }

    @Transactional
    public GroupResponse joinGroup(String inviteCode, User user) {
        Group group = groupRepository.findByInviteCode(inviteCode.toUpperCase())
            .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));
        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new IllegalArgumentException("Already a member of this group");
        }
        groupMemberRepository.save(GroupMember.builder().group(group).user(user).build());
        return new GroupResponse(group.getId(), group.getName(), group.getInviteCode(), group.getCreatedAt());
    }

    public List<MemberDto> getMembers(UUID groupId) {
        return groupMemberRepository.findByGroupIdWithUser(groupId).stream()
            .map(gm -> new MemberDto(gm.getUser().getId(), gm.getUser().getName(), gm.getUser().getEmail()))
            .toList();
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        return sb.toString();
    }
}
