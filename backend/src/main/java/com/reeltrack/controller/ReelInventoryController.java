package com.reeltrack.controller;

import com.reeltrack.model.Reel;

import com.reeltrack.service.ReelService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/reel-inventory")
@SecurityRequirement(name = "bearerAuth")
public class ReelInventoryController {

    private final ReelService reelService;

    public ReelInventoryController(ReelService reelService) {
        this.reelService = reelService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<Reel>> getAll(@RequestParam(required = false) String unit) {
        List<Reel> reels = reelService.getAll(Optional.ofNullable(unit));
        return ResponseEntity.ok(reels);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<Reel> getById(@PathVariable String id) {
        return reelService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> create(@RequestBody Reel reel) {
        Reel saved = reelService.create(reel);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/bulk-add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reel>> bulkAdd(@RequestBody List<Reel> reels) {
        List<Reel> saved = reelService.bulkCreate(reels);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> importReels(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "File is empty"));
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            List<Reel> reels = new ArrayList<>();
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // skip header
                    continue;
                }
                String[] parts = line.split(",");
                if (parts.length >= 6) {
                    Reel reel = new Reel();
                    // Example CSV: Reel ID, Name, Mill, Type, Width, GSM, Original Weight, Current Weight
                    // We only require minimal fields to create.
                    String id = parts[0].trim();
                    if (!id.isEmpty()) reel.setId(id);
                    reel.setName(parts[1].trim());
                    reel.setMill(parts[2].trim());
                    reel.setType(parts[3].trim());
                    reel.setWidth(Integer.parseInt(parts[4].trim()));
                    reel.setGsm(Integer.parseInt(parts[5].trim()));
                    if (parts.length > 6 && !parts[6].trim().isEmpty()) {
                        reel.setOrig(Double.parseDouble(parts[6].trim()));
                    }
                    if (parts.length > 7 && !parts[7].trim().isEmpty()) {
                        reel.setWeight(new BigDecimal(parts[7].trim()));
                    } else if (reel.getOrig() != null) {
                        reel.setWeight(new BigDecimal(reel.getOrig()));
                    }
                    reels.add(reel);
                }
            }
            List<Reel> saved = reelService.bulkCreate(reels);
            return ResponseEntity.ok(java.util.Map.of("message", "Import successful", "count", saved.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Error parsing file: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> update(@PathVariable String id, @RequestBody Reel details) {
        return reelService.update(id, details)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> toggleActive(@PathVariable String id) {
        return reelService.toggleActive(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/adjust-weight")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adjustWeight(@PathVariable String id, @RequestBody WeightAdjustmentRequest req) {
        try {
            return reelService.adjustWeight(id, req.newWeight(), req.force())
                    .map(ResponseEntity::ok)
                    .orElse((ResponseEntity)ResponseEntity.notFound().build());
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getReason().startsWith("WARNING:")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("warning", e.getReason()));
            }
            throw e;
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<Reel>> search(
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) String mill,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean active) {
        List<Reel> reels = reelService.search(unit, mill, type, active);
        return ResponseEntity.ok(reels);
    }

    @PostMapping("/{id}/hold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> hold(@PathVariable String id, @RequestBody(required = false) StatusRequest req) {
        return reelService.updateStatus(id, "ON_HOLD", req != null ? req.notes() : null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/write-off")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> writeOff(@PathVariable String id, @RequestBody(required = false) StatusRequest req) {
        return reelService.updateStatus(id, "WRITTEN_OFF", req != null ? req.notes() : null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/release")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reel> release(@PathVariable String id, @RequestBody(required = false) StatusRequest req) {
        return reelService.updateStatus(id, "AVAILABLE", req != null ? req.notes() : null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/correction")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> correction(@PathVariable String id, @RequestBody CorrectionRequest req) {
        try {
            return reelService.applyCorrection(id, req.weightDelta(), req.notes(), req.force())
                    .map(ResponseEntity::ok)
                    .orElse((ResponseEntity)ResponseEntity.notFound().build());
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getReason().startsWith("WARNING:")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("warning", e.getReason()));
            }
            throw e;
        }
    }

    @GetMapping("/{id}/label")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<?> printLabel(@PathVariable String id) {
        // Stub for printing label
        return reelService.getById(id)
                .map(r -> ResponseEntity.ok().body(java.util.Map.of("message", "Label printing stub", "reelId", r.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    public static record WeightAdjustmentRequest(BigDecimal newWeight, Boolean force) {}
    public static record StatusRequest(String notes) {}
    public static record CorrectionRequest(BigDecimal weightDelta, String notes, Boolean force) {}
}
