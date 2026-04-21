package com.commutesplit.repository;

import com.commutesplit.entity.Group;
import com.commutesplit.entity.GroupMember;
import com.commutesplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupAndUser(Group group, User user);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupIdWithUser(UUID groupId);
}
