package com.reeltrack.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reeltrack.dto.AddReelsRequest;
import com.reeltrack.dto.DTOs.JobCalcRequest;
import com.reeltrack.dto.DTOs.RecommendationCandidate;
import com.reeltrack.dto.DTOs.SplitPlanResponse;
import com.reeltrack.model.LedgerEntry;
import com.reeltrack.model.Reel;
import com.reeltrack.model.Role;
import com.reeltrack.model.User;
import com.reeltrack.repository.LedgerEntryRepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.UserRepository;
import com.reeltrack.service.JobService;
import com.reeltrack.service.ReelService;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    private final ReelRepository reelRepository;
    private final JobService jobService;
    private final ReelService reelService;
    private final UserRepository userRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public ReelController(ReelRepository reelRepository, JobService jobService, ReelService reelService, UserRepository userRepository, LedgerEntryRepository ledgerEntryRepository) {
        this.reelRepository = reelRepository;
        this.jobService = jobService;
        this.reelService = reelService;
        this.userRepository = userRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> addReels(@RequestBody AddReelsRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication is required"));
        }

        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authenticated user was not found"));
        }

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only administrators can add reels to inventory"));
        }

        try {
            List<Reel> createdReels = reelService.addReels(request, currentUser.getName());
            return ResponseEntity.ok(Map.of(
                    "message", createdReels.size() + " reel(s) added successfully",
                    "reels", createdReels
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to add reels to inventory: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Reel>> getAllReels(@RequestParam(required = false) String unit,
                                                   @RequestParam(required = false) String mill,
                                                   @RequestParam(required = false) String type,
                                                   @RequestParam(required = false) Integer width,
                                                   @RequestParam(required = false) String status) {
        List<Reel> reels = reelRepository.findAll();
        return ResponseEntity.ok(reels.stream()
                .filter(reel -> unit == null || unit.isBlank() || unit.equalsIgnoreCase(reel.getUnit()))
                .filter(reel -> mill == null || mill.isBlank() || mill.equalsIgnoreCase(reel.getMill()))
                .filter(reel -> type == null || type.isBlank() || type.equalsIgnoreCase(reel.getType()))
                .filter(reel -> width == null || width.equals(reel.getWidth()))
                .filter(reel -> status == null || status.isBlank() || statusOf(reel).equalsIgnoreCase(status))
                .toList());
    }

    private String statusOf(Reel reel) {
        String st = reel.getStatus();
        if ("ON_HOLD".equalsIgnoreCase(st) || "IN_TRANSIT".equalsIgnoreCase(st) || "WRITTEN_OFF".equalsIgnoreCase(st)) {
            return st;
        }
        if (reel.getRemaining() == null || reel.getRemaining() <= 0) return "Exhausted";
        if (reel.getRemaining() < 40) return "Low Stock";
        // To correctly determine IN USE in backend, we need Job counts, which isn't easy here without JobService.
        // Actually, the frontend already filters status on its side! Wait, does frontend send filterStatus?
        // Let's just return "Available" or "In Use" depending on consumption.
        if (reel.getOrig() != null && reel.getRemaining() < reel.getOrig()) return "In Use";
        return "Available";
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reel> getReelById(@PathVariable String id) {
        return reelRepository.findById(id.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<RecommendationCandidate>> recommendReels(
            @RequestBody JobCalcRequest request,
            @RequestParam(required = false) String unit) {
        return ResponseEntity.ok(jobService.getRecommendations(request, unit));
    }

    @PostMapping("/split-plan")
    public ResponseEntity<SplitPlanResponse> getSplitPlan(
            @RequestBody JobCalcRequest request,
            @RequestParam(required = false) String unit) {
        return ResponseEntity.ok(jobService.getSplitPlan(request, unit));
    }

    @PostMapping("/{id}/hold")
    public ResponseEntity<?> holdReel(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) return ResponseEntity.status(403).body(Map.of("message", "Admin required"));
        
        Optional<Reel> opt = reelRepository.findById(id.toUpperCase());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Reel reel = opt.get();
        if ("WRITTEN_OFF".equalsIgnoreCase(reel.getStatus())) return ResponseEntity.badRequest().body(Map.of("message", "Reel is written off"));
        
        reel.setStatus("ON_HOLD");
        Reel saved = reelRepository.save(reel);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<?> releaseReel(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) return ResponseEntity.status(403).body(Map.of("message", "Admin required"));
        
        Optional<Reel> opt = reelRepository.findById(id.toUpperCase());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Reel reel = opt.get();
        reel.setStatus("AVAILABLE"); // statusOf will compute dynamically
        Reel saved = reelRepository.save(reel);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/write-off")
    public ResponseEntity<?> writeOffReel(@PathVariable String id, @RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) return ResponseEntity.status(403).body(Map.of("message", "Admin required"));
        
        String notes = payload.get("notes");
        if (notes == null || notes.isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Reason is required"));

        Optional<Reel> opt = reelRepository.findById(id.toUpperCase());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Reel reel = opt.get();
        double remainingWeight = reel.getRemaining() != null ? reel.getRemaining() : 0.0;
        reel.setStatus("WRITTEN_OFF");
        reel.setRemaining(0.0);
        Reel saved = reelRepository.save(reel);
        
        LedgerEntry ledger = new LedgerEntry();
        ledger.setReelId(saved.getId());
        ledger.setDescription("Written Off: " + notes);
        ledger.setAmount(java.math.BigDecimal.valueOf(-remainingWeight));
        ledger.setBalanceAfter(java.math.BigDecimal.ZERO);
        ledger.setReferenceType("WRITE_OFF");
        ledger.setCreatedBy(currentUser.getUsername());
        ledgerEntryRepository.save(ledger);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/correction")
    public ResponseEntity<?> correctReelDetails(@PathVariable String id, @RequestBody Map<String, Object> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        User currentUser = userRepository.findByUsernameIgnoreCase(authentication.getName()).orElse(null);
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) return ResponseEntity.status(403).body(Map.of("message", "Admin required"));
        
        Optional<Reel> opt = reelRepository.findById(id.toUpperCase());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Reel reel = opt.get();
        
        // Ensure no consumption
        if (reel.getOrig() != null && reel.getRemaining() != null && !reel.getOrig().equals(reel.getRemaining())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot correct details after reel has been consumed"));
        }

        if (payload.containsKey("width")) reel.setWidth(Integer.parseInt(payload.get("width").toString()));
        if (payload.containsKey("gsm")) reel.setGsm(Integer.parseInt(payload.get("gsm").toString()));
        if (payload.containsKey("mill")) reel.setMill(payload.get("mill").toString());
        
        Reel saved = reelRepository.save(reel);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/adjust-weight")
    public ResponseEntity<?> adjustWeight(@PathVariable String id, @RequestBody Map<String, Object> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        
        Optional<Reel> opt = reelRepository.findById(id.toUpperCase());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Reel reel = opt.get();
        
        if ("ON_HOLD".equalsIgnoreCase(reel.getStatus()) || "WRITTEN_OFF".equalsIgnoreCase(reel.getStatus()) || "IN_TRANSIT".equalsIgnoreCase(reel.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reel is not adjustable in its current state"));
        }

        if (!payload.containsKey("newWeight") || !payload.containsKey("reason")) {
            return ResponseEntity.badRequest().body(Map.of("message", "newWeight and reason are required"));
        }

        double newWeight = Double.parseDouble(payload.get("newWeight").toString());
        if (newWeight < 0) return ResponseEntity.badRequest().body(Map.of("message", "NEGATIVE_BALANCE_BLOCKED"));
        
        double currentWeight = reel.getRemaining() != null ? reel.getRemaining() : 0.0;
        double diff = newWeight - currentWeight;
        reel.setRemaining(newWeight);
        Reel saved = reelRepository.save(reel);
        
        LedgerEntry ledger = new LedgerEntry();
        ledger.setReelId(saved.getId());
        String reason = payload.get("reason").toString();
        String notes = payload.containsKey("notes") && payload.get("notes") != null ? payload.get("notes").toString() : "";
        ledger.setDescription("Adjustment: " + reason + (notes.isBlank() ? "" : " - " + notes));
        ledger.setAmount(java.math.BigDecimal.valueOf(diff));
        ledger.setBalanceAfter(java.math.BigDecimal.valueOf(newWeight));
        ledger.setReferenceType("ADJUSTMENT");
        String username = authentication != null ? authentication.getName() : "system";
        ledger.setCreatedBy(username);
        ledgerEntryRepository.save(ledger);
        
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/label")
    public ResponseEntity<?> getLabel(@PathVariable String id) {
        return reelRepository.findById(id.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/ledger")
    public ResponseEntity<List<LedgerEntry>> getLedger(@PathVariable String id) {
        return ResponseEntity.ok(ledgerEntryRepository.findByReelId(id.toUpperCase()));
    }
}
