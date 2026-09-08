package com.reeltrack.controller;

import com.reeltrack.model.User;
import com.reeltrack.service.AuthService;
import com.reeltrack.service.AuthService.LoginResult;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request == null ||
            request.username() == null ||
            request.username().trim().isEmpty() ||
            request.password() == null ||
            request.password().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        new ErrorResponse(
                            "Username and password are required"
                        )
                    );
        }

        LoginResult result =
                authService.login(
                    request.username(),
                    request.password()
                );

        if (!result.isSuccess()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                        new ErrorResponse(
                            "Invalid username or password"
                        )
                    );
        }

        User user = result.getUser();

        return ResponseEntity.ok(
            new LoginResponse(
                result.getToken(),
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole().name(),
                user.getUnitId(),
                user.isPasswordChangeRequired()
            )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            org.springframework.security.core.Authentication authentication) {

        return ResponseEntity.ok(
            new Object() {
                public final String username =
                        authentication.getName();

                public final String role =
                        authentication
                            .getAuthorities()
                            .iterator()
                            .next()
                            .getAuthority()
                            .replace("ROLE_", "");
            }
        );
    }

    public record LoginRequest(
            String username,
            String password
    ) {}

    public record LoginResponse(
            String token,
            Long userId,
            String username,
            String name,
            String role,
            String unitId,
            boolean passwordChangeRequired
    ) {}

    public record ErrorResponse(
            String message
    ) {}
}