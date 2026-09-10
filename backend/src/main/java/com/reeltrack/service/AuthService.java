package com.reeltrack.service;

import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.reeltrack.model.User;
import com.reeltrack.repository.UserRepository;
import com.reeltrack.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    // 15 minutes temporary lock
    private static final int LOCK_MINUTES = 15;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResult login(
            String loginId,
            String rawPassword) {

        String normalizedLoginId =
                loginId == null
                    ? ""
                    : loginId.trim();

        User user = findUser(normalizedLoginId);

        /*
         * Generic failure.
         *
         * Do not tell the client:
         * - user does not exist
         * - password incorrect
         * - account locked
         *
         * This follows the PRD.
         */

        if (user == null) {
            return LoginResult.failure(
                    "Invalid username or password"
            );
        }

        // Account inactive
        if (!user.isActive()) {
            return LoginResult.failure(
                    "Invalid username or password"
            );
        }

        // Check lock
        if (isLocked(user)) {
            return LoginResult.failure(
                    "Invalid username or password"
            );
        }

        // Password check
        if (!passwordEncoder.matches(
                rawPassword,
                user.getPassword())) {

            registerFailure(user);

            return LoginResult.failure(
                    "Invalid username or password"
            );
        }

        // Successful login
        clearFailures(user);

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getUnitId(),
                user.getName()
        );

        return LoginResult.success(
                token,
                user
        );
    }

    private User findUser(String loginId) {

        return userRepository
                .findByUsernameIgnoreCase(loginId)
                .or(() ->
                    userRepository
                        .findByEmailIgnoreCase(loginId))
                .or(() ->
                    userRepository
                        .findByMobile(loginId))
                .orElse(null);
    }

    private boolean isLocked(User user) {

        if (user.getLockedUntil() == null) {
            return false;
        }

        if (user.getLockedUntil()
                .isAfter(LocalDateTime.now())) {

            return true;
        }

        // Lock expired
        user.setLockedUntil(null);
        user.setFailedLoginAttempts(0);

        userRepository.save(user);

        return false;
    }

    private void registerFailure(User user) {

        int attempts =
                user.getFailedLoginAttempts() + 1;

        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {

            user.setLockedUntil(
                LocalDateTime.now()
                    .plusMinutes(LOCK_MINUTES)
            );
        }

        userRepository.save(user);
    }

    private void clearFailures(User user) {

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);
    }

    public User getCurrentUser(String username) {
    return userRepository.findByUsernameIgnoreCase(username)
            .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));
    }
    // =============================
    // Login Result
    // =============================

    public static class LoginResult {

        private final boolean success;
        private final String message;
        private final String token;
        private final User user;

        private LoginResult(
                boolean success,
                String message,
                String token,
                User user) {

            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }

        public static LoginResult success(
                String token,
                User user) {

            return new LoginResult(
                    true,
                    null,
                    token,
                    user
            );
        }

        public static LoginResult failure(
                String message) {

            return new LoginResult(
                    false,
                    message,
                    null,
                    null
            );
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public String getToken() {
            return token;
        }

        public User getUser() {
            return user;
        }
    }
}