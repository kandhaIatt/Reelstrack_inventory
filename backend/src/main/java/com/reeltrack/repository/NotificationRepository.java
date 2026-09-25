package com.reeltrack.repository;

import com.reeltrack.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<Notification> findByTargetRoleInOrderByCreatedAtDesc(List<String> targetRoles);
}
