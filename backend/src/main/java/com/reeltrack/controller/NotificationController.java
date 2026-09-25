package com.reeltrack.controller;

import com.reeltrack.model.Notification;
import com.reeltrack.model.User;
import com.reeltrack.repository.UserRepository;
import com.reeltrack.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user was not found"));
        }

        List<Notification> notifications = notificationService.getNotificationsForRole(user.getRole().name());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user was not found"));
        }

        long count = notificationService.getUnreadCountForRole(user.getRole().name());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user was not found"));
        }

        boolean updated = notificationService.markAsRead(id, user.getRole().name());
        if (!updated) {
            return ResponseEntity.status(404).body(Map.of("message", "Notification not found or access denied"));
        }
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user was not found"));
        }

        int updatedCount = notificationService.markAllAsReadForRole(user.getRole().name());
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "updatedCount", updatedCount
        ));
    }
}