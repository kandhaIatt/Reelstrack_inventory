package com.reeltrack.controller;

import com.reeltrack.model.*;
import com.reeltrack.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ReelRepository reelRepository;
    private final CuttingJobRepository jobRepository;
    private final PORepository poRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardController(ReelRepository reelRepository, CuttingJobRepository jobRepository,
                               PORepository poRepository, ActivityLogRepository activityLogRepository) {
        this.reelRepository = reelRepository;
        this.jobRepository = jobRepository;
        this.poRepository = poRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam(required = false) String unit) {
        List<Reel> reels = reelRepository.findAll();
        List<CuttingJob> jobs = jobRepository.findAll();
        List<PurchaseOrder> pos = poRepository.findAll();

        if (unit != null && !unit.trim().isEmpty()) {
            reels = reelRepository.findByUnit(unit.trim());
            jobs = jobRepository.findByUnit(unit.trim());
            pos = poRepository.findByUnit(unit.trim());
        }

        double totalOrigWeight = reels.stream().mapToDouble(Reel::getOrig).sum();
        double availableWeight = reels.stream().mapToDouble(Reel::getRemaining).sum();
        double consumedWeight = totalOrigWeight - availableWeight;
        long activeJobs = jobs.stream().filter(j -> "In Progress".equalsIgnoreCase(j.getStatus())).count();
        long pendingPOs = pos.stream().filter(p -> "Pending Approval".equalsIgnoreCase(p.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReels", reels.size());
        stats.put("totalWeight", totalOrigWeight);
        stats.put("availableWeight", availableWeight);
        stats.put("consumedWeight", consumedWeight);
        stats.put("activeJobs", activeJobs);
        stats.put("pendingPOs", pendingPOs);
        stats.put("totalPOs", pos.size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(activityLogRepository.findAll());
    }
}
