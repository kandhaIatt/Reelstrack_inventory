package com.reeltrack.controller;

import com.reeltrack.dto.MasterDTOs.*;
import com.reeltrack.model.*;
import com.reeltrack.service.MasterDataService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.reeltrack.repository.UserRepository;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
public class MasterController {

    private final MasterDataService masterDataService;
    private final UserRepository userRepository;

    public MasterController(MasterDataService masterDataService, UserRepository userRepository) {
        this.masterDataService = masterDataService;
        this.userRepository = userRepository;
    }

    // ==========================================
    // UNITS
    // ==========================================
    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getUnits(@RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.getUnits(activeOnly));
    }

    @GetMapping("/units/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable String id) {
        return masterDataService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/units")
    public ResponseEntity<Unit> createUnit(@Valid @RequestBody UnitRequest request) {
        return ResponseEntity.ok(masterDataService.saveUnit(request));
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable String id, @RequestBody Unit details) {
        try {
            return ResponseEntity.ok(masterDataService.updateUnit(id, details));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/units/{id}/toggle-active", "/units/{id}/active"})
    public ResponseEntity<Unit> toggleUnitActive(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            Boolean active = body != null && body.containsKey("active") ? (Boolean) body.get("active") : null;
            return ResponseEntity.ok(masterDataService.setUnitActive(id, active));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/units/{id}")
    public ResponseEntity<?> deleteUnit(@PathVariable String id) {
        masterDataService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // MILLS
    // ==========================================
    @GetMapping("/mills")
    public ResponseEntity<List<Mill>> getMills(@RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.getMills(activeOnly));
    }

    @GetMapping("/mills/{id}")
    public ResponseEntity<Mill> getMillById(@PathVariable String id) {
        return masterDataService.getMillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mills")
    public ResponseEntity<Mill> createMill(@Valid @RequestBody MillRequest request) {
        return ResponseEntity.ok(masterDataService.saveMill(request));
    }

    @PutMapping("/mills/{id}")
    public ResponseEntity<Mill> updateMill(@PathVariable String id, @RequestBody Mill details) {
        try {
            return ResponseEntity.ok(masterDataService.updateMill(id, details));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/mills/{id}/toggle-active", "/mills/{id}/active"})
    public ResponseEntity<Mill> toggleMillActive(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            Boolean active = body != null && body.containsKey("active") ? (Boolean) body.get("active") : null;
            return ResponseEntity.ok(masterDataService.setMillActive(id, active));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/mills/{id}")
    public ResponseEntity<?> deleteMill(@PathVariable String id) {
        masterDataService.deleteMill(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // REEL TYPES
    // ==========================================
    @GetMapping("/reel-types")
    public ResponseEntity<List<ReelType>> getReelTypes(@RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(masterDataService.getReelTypes(activeOnly));
    }

    @GetMapping("/reel-types/{id}")
    public ResponseEntity<ReelType> getReelTypeById(@PathVariable String id) {
        return masterDataService.getReelTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reel-types")
    public ResponseEntity<ReelType> createReelType(@Valid @RequestBody ReelTypeRequest request) {
        return ResponseEntity.ok(masterDataService.saveReelType(request));
    }

    @PutMapping("/reel-types/{id}")
    public ResponseEntity<ReelType> updateReelType(@PathVariable String id, @RequestBody ReelType details) {
        try {
            return ResponseEntity.ok(masterDataService.updateReelType(id, details));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/reel-types/{id}/toggle-active", "/reel-types/{id}/active"})
    public ResponseEntity<ReelType> toggleReelTypeActive(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            Boolean active = body != null && body.containsKey("active") ? (Boolean) body.get("active") : null;
            return ResponseEntity.ok(masterDataService.setReelTypeActive(id, active));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/reel-types/{id}")
    public ResponseEntity<?> deleteReelType(@PathVariable String id) {
        masterDataService.deleteReelType(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // SUPPLIERS
    // ==========================================
    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(masterDataService.getSuppliers());
    }

    @GetMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable String id) {
        return masterDataService.getSupplierById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(masterDataService.saveSupplier(request));
    }

    @PutMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier details) {
        try {
            return ResponseEntity.ok(masterDataService.updateSupplier(id, details));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/suppliers/{id}/toggle-active", "/suppliers/{id}/active"})
    public ResponseEntity<Supplier> toggleSupplierActive(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            Boolean active = body != null && body.containsKey("active") ? (Boolean) body.get("active") : null;
            return ResponseEntity.ok(masterDataService.setSupplierActive(id, active));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable String id) {
        masterDataService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // USERS
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(masterDataService.getUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return masterDataService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request) {
        try {
            return ResponseEntity.ok(masterDataService.createUser(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest request, org.springframework.security.core.Authentication authentication) {
        try {
            return ResponseEntity.ok(masterDataService.updateUser(id, request, authentication != null ? authentication.getName() : null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping({"/users/{id}/toggle-active", "/users/{id}/active"})
    public ResponseEntity<User> toggleUserActive(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            Boolean active = body != null && body.containsKey("active") ? (Boolean) body.get("active") : null;
            return ResponseEntity.ok(masterDataService.setUserActive(id, active));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/users/{id}/password", "/masters/users/{id}/password"})
    public ResponseEntity<?> changeUserPassword(@PathVariable Long id, @RequestBody PasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user not found"));
        }

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can change another user's password"));
        }

        if (request == null || request.newPassword() == null || request.newPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required"));
        }

        try {
            User updated = masterDataService.changeUserPassword(id, request.newPassword());
            return ResponseEntity.ok(Map.of("message", "User password changed successfully for " + updated.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        masterDataService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    public record PasswordRequest(String newPassword) {}

    // ==========================================
    // CONFIG & SETTINGS
    // ==========================================
    @GetMapping("/config")
    public ResponseEntity<BusinessConfig> getConfig() {
        return ResponseEntity.ok(masterDataService.getConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<BusinessConfig> updateConfig(@RequestBody BusinessConfig details) {
        return ResponseEntity.ok(masterDataService.updateConfig(details));
    }

    @GetMapping("/settings")
    public ResponseEntity<List<AppSetting>> getSettings() {
        return ResponseEntity.ok(masterDataService.getSettings());
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<AppSetting> saveSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body != null ? body.get("value") : "";
        return ResponseEntity.ok(masterDataService.saveSetting(key, value));
    }
}
