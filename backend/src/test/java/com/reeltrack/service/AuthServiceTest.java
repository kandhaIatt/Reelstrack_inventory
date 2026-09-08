package com.reeltrack.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.reeltrack.model.Role;
import com.reeltrack.model.User;
import com.reeltrack.repository.UserRepository;
import com.reeltrack.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;

    private AuthService service;
    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
        service = new AuthService(userRepository, passwordEncoder, jwtUtil);
        user = User.builder().username("operator").password("hash").name("Operator")
                .role(Role.OPERATOR).unitId("U1").build();
    }

    @Test
    void loginIssuesTokenAndClearsPreviousFailures() {
        user.setFailedLoginAttempts(2);
        when(userRepository.findByUsernameIgnoreCase("operator")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);

        AuthService.LoginResult result = service.login(" operator ", "password");

        assertTrue(result.isSuccess());
        assertTrue(result.getToken() != null);
        assertTrue(jwtUtil.validateToken(result.getToken(), new org.springframework.security.core.userdetails.User(
            "operator", "hash", java.util.List.of())));
        verify(userRepository).save(user);
    }

    @Test
    void repeatedInvalidPasswordsLockAccount() {
        user.setFailedLoginAttempts(4);
        when(userRepository.findByUsernameIgnoreCase("operator")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        AuthService.LoginResult result = service.login("operator", "wrong");

        assertFalse(result.isSuccess());
        assertTrue(user.getFailedLoginAttempts() == 5);
        assertTrue(user.getLockedUntil() != null);
        verify(userRepository).save(user);
    }
}
