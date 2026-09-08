package com.reeltrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reeltrack.dto.DTOs.JobCalcRequest;
import com.reeltrack.dto.DTOs.RecommendationCandidate;
import com.reeltrack.dto.DTOs.SplitPlanResponse;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.service.JobService;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    private final ReelRepository reelRepository;
    private final JobService jobService;

    public ReelController(ReelRepository reelRepository, JobService jobService) {
        this.reelRepository = reelRepository;
        this.jobService = jobService;
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
        if (reel.getRemaining() == null || reel.getRemaining() < 1) return "Exhausted";
        if (reel.getOrig() != null && reel.getRemaining() / reel.getOrig() < 0.25) return "Low Stock";
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
}
