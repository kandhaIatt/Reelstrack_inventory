package com.reeltrack.service;

import com.reeltrack.model.Notification;
import com.reeltrack.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public NotificationService(NotificationRepository notificationRepository, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void createNotification(String title, String message, String targetRole) {
        Notification notification = new Notification(title, message, targetRole);
        notificationRepository.save(notification);
        eventPublisher.publishEvent(notification);
    }

    public List<Notification> getNotificationsForRole(String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(Arrays.asList("ADMIN", "ALL"));
        } else {
            return notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(Arrays.asList("USER", "ALL", role));
        }
    }

    public long getUnreadCountForRole(String role) {
        return getNotificationsForRole(role).stream().filter(n -> !n.isReadStatus()).count();
    }

    @Transactional
    public boolean markAsRead(Long id, String role) {
        // Find notification
        java.util.Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            // Optional: verify that the role matches the notification's targetRole before marking as read
            n.setReadStatus(true);
            notificationRepository.save(n);
            return true;
        }
        return false;
    }

    @Transactional
    public int markAllAsReadForRole(String role) {
        List<Notification> unread = getNotificationsForRole(role).stream()
                .filter(n -> !n.isReadStatus())
                .collect(java.util.stream.Collectors.toList());
        for (Notification n : unread) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(unread);
        return unread.size();
    }
}
