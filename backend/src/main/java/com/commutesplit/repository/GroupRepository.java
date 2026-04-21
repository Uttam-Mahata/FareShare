package com.commutesplit.repository;

import com.commutesplit.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {
    Optional<Group> findByInviteCode(String inviteCode);
}
