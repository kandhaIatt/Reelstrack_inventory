package com.reeltrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reeltrack.dto.DTOs.*;
import com.reeltrack.dto.DTOs.JobCalcRequest;
import com.reeltrack.dto.DTOs.JobCalcResponse;
import com.reeltrack.model.CuttingJob;
import com.reeltrack.repository.CuttingJobRepository;
import com.reeltrack.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final CuttingJobRepository jobRepository;
    private final JobService jobService;

    public JobController(CuttingJobRepository jobRepository, JobService jobService) {
        this.jobRepository = jobRepository;
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<CuttingJob>> getAllJobs(@RequestParam(required = false) String unit,
                                                       @RequestParam(required = false) String reel) {
        if (reel != null && !reel.trim().isEmpty()) {
            return ResponseEntity.ok(jobRepository.findByReel(reel.trim()));
        }
        if (unit != null && !unit.trim().isEmpty()) {
            return ResponseEntity.ok(jobRepository.findByUnit(unit.trim()));
        }
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping("/calculate")
    public ResponseEntity<JobCalcResponse> calculateJob(@RequestBody JobCalcRequest request) {
        return ResponseEntity.ok(jobService.calculate(request));
    }

    @PostMapping("/execute")
    public ResponseEntity<CuttingJob> executeJob(@RequestBody JobCalcRequest request, Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "Operator";
        return ResponseEntity.ok(jobService.executeJob(request, operator));
    }

    @PostMapping("/execute-split")
    public ResponseEntity<List<CuttingJob>> executeSplitJob(@RequestBody JobCalcRequest request, Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "Operator";
        return ResponseEntity.ok(jobService.executeSplitJob(request, operator));
    }
}
