package com.reeltrack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import  com.reeltrack.model.User;
import com.reeltrack.service.AuthService;
import com.reeltrack.service.AuthService.LoginResult;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

   @SecurityRequirement(name = "bearerAuth")
   @GetMapping("/me")
     public ResponseEntity<?> me(
        org.springframework.security.core.Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Not authenticated"));
        }

       User user = authService.getCurrentUser(authentication.getName());

         return ResponseEntity.ok(
            new MeResponse(
              user.getId(),
              user.getUsername(),
              user.getName(),
              user.getRole().name(),
              user.getUnitId(),
              user.isPasswordChangeRequired()
            )
        );
    }

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            org.springframework.security.core.Authentication authentication,
            @RequestBody PasswordChangeRequest request) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Not authenticated"));
        }

        if (request == null || request.currentPassword() == null || request.newPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Current password and new password are required"));
        }

        try {
            authService.changePassword(authentication.getName(), request.currentPassword(), request.newPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.usernameOrEmail() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Username or email is required"));
        }
        
        String token = authService.generateResetToken(request.usernameOrEmail());
        if (token != null) {
            // Ideally send an email here. For now, we will return it in response (or simulate email send).
            // Usually, we shouldn't return token in response for security, but without SMTP we return it for testing.
            System.out.println("RESET TOKEN FOR " + request.usernameOrEmail() + ": " + token);
            return ResponseEntity.ok(java.util.Map.of("message", "If the account exists, a reset link has been sent.", "token", token));
        }
        
        return ResponseEntity.ok(java.util.Map.of("message", "If the account exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null || request.token() == null || request.newPassword() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Token and new password are required"));
        }
        
        boolean success = authService.resetPassword(request.token(), request.newPassword());
        if (success) {
            return ResponseEntity.ok(java.util.Map.of("message", "Password has been successfully reset."));
        } else {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid or expired token"));
        }
    }

       public record PasswordChangeRequest(
          String currentPassword,
          String newPassword
       ) {}

       public record ForgotPasswordRequest(
          String usernameOrEmail
       ) {}

       public record ResetPasswordRequest(
          String token,
          String newPassword
       ) {}

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

        public record MeResponse(
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