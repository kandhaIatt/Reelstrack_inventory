package com.reeltrack.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.reeltrack.dto.DTOs.JobCalcRequest;
import com.reeltrack.dto.DTOs.JobCalcResponse;
import com.reeltrack.dto.DTOs.RecommendationCandidate;
import com.reeltrack.dto.DTOs.SplitLeg;
import com.reeltrack.dto.DTOs.SplitPlanResponse;
import com.reeltrack.model.ActivityLog;
import com.reeltrack.model.CuttingJob;
import com.reeltrack.model.Reel;
import com.reeltrack.model.Role;
import com.reeltrack.model.User;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.CuttingJobRepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.UserRepository;

import com.reeltrack.model.LedgerEntry;
import com.reeltrack.repository.LedgerEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class JobService {

    private final ReelRepository reelRepository;
    private final CuttingJobRepository jobRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final NotificationService notificationService;

    public JobService(ReelRepository reelRepository, CuttingJobRepository jobRepository,
                      ActivityLogRepository activityLogRepository, UserRepository userRepository,
                      LedgerEntryRepository ledgerEntryRepository, NotificationService notificationService) {
        this.reelRepository = reelRepository;
        this.jobRepository = jobRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.notificationService = notificationService;
    }

    public JobCalcResponse calculate(JobCalcRequest req) {
        validateRequest(req, false);
        boolean corr = req.getCorr() != null && req.getCorr();
        double factor = req.getF() != null ? req.getF() : 0.45;
        double effGsm = corr ? req.getGsm() * (1 + factor) : req.getGsm();

        double kg = req.getSheets() * effGsm * (req.getW() / 100.0) * (req.getL() / 100.0) / 1000.0;
        double waste = req.getWaste() != null ? req.getWaste() : 0.0;
        double totalKg = kg + waste;

        Reel reel = null;
        if (req.getReelId() != null && !req.getReelId().trim().isEmpty()) {
            reel = reelRepository.findById(req.getReelId().trim().toUpperCase()).orElse(null);
        }

        double prevBalance = reel != null ? reel.getRemaining() : 0.0;
        double afterBalance = prevBalance - totalKg;
        double shortKg = totalKg - prevBalance;
        boolean isWidthOk = reel == null || req.getW() <= reel.getWidth();
        boolean isOk = reel != null && isWidthOk && totalKg > 0 && totalKg <= prevBalance;

        Integer maxSheets = null;
        String errorCode = null;

        if (reel != null && totalKg > prevBalance) {
            errorCode = "INSUFFICIENT_MATERIAL";
            double perSheetTotalKg = totalKg / req.getSheets();
            if (perSheetTotalKg > 0) {
                maxSheets = (int) Math.floor(prevBalance / perSheetTotalKg);
            } else {
                maxSheets = 0;
            }
        } else if (!isWidthOk) {
            errorCode = "INVALID_WIDTH";
        }

        return JobCalcResponse.builder()
                .effGsm(effGsm)
                .kg(kg)
                .waste(waste)
                .totalKg(totalKg)
                .prevBalance(prevBalance)
                .afterBalance(afterBalance)
                .shortKg(shortKg > 0 ? shortKg : 0.0)
                .isWidthOk(isWidthOk)
                .isOk(isOk)
                .maxSheets(maxSheets)
                .errorCode(errorCode)
                .build();
    }

    public List<RecommendationCandidate> getRecommendations(JobCalcRequest req, String userUnit) {
        validateRequest(req, false);
        JobCalcResponse calc = calculate(req);
        double reqKg = calc.getKg();

        List<Reel> pool = reelRepository.findAll();
        if (userUnit != null && !userUnit.isEmpty()) {
            pool = pool.stream().filter(r -> r.getUnit().equalsIgnoreCase(userUnit)).collect(Collectors.toList());
        }

        List<RecommendationCandidate> candidates = new ArrayList<>();
        for (Reel r : pool) {
            double rem = r.getRemaining();
            boolean fitsWidth = r.getWidth() >= req.getW();
            boolean enough = rem >= reqKg;
            int trim = r.getWidth() - req.getW();
            boolean gsmMatch = r.getGsm().equals(req.getGsm());
            double leftover = rem - reqKg;

            if (fitsWidth && enough && reqKg > 0) {
                boolean finishingPartial = r.getRemaining() < r.getOrig();
                double score = (gsmMatch ? 0 : 1000)
                    + (finishingPartial ? -100 : 0)
                    + trim * 10
                    + Math.max(0, leftover) * 0.05;
                candidates.add(RecommendationCandidate.builder()
                        .reel(r)
                        .rem(rem)
                        .req(reqKg)
                        .fitsWidth(fitsWidth)
                        .enough(enough)
                        .trim(trim)
                        .gsmMatch(gsmMatch)
                        .leftover(leftover)
                        .score(score)
                        .build());
            }
        }
        candidates.sort(Comparator.comparingDouble(RecommendationCandidate::getScore));
        return candidates;
    }

    public SplitPlanResponse getSplitPlan(JobCalcRequest req, String userUnit) {
        validateRequest(req, false);
        boolean corr = req.getCorr() != null && req.getCorr();
        double factor = req.getF() != null ? req.getF() : 0.45;
        double effGsm = corr ? req.getGsm() * (1 + factor) : req.getGsm();
        double perSheetKg = effGsm * (req.getW() / 100.0) * (req.getL() / 100.0) / 1000.0;

        List<Reel> pool = reelRepository.findAll().stream()
                .filter(r -> r.getWidth() >= req.getW() && r.getRemaining() >= perSheetKg)
                .collect(Collectors.toList());

        if (userUnit != null && !userUnit.isEmpty()) {
            pool = pool.stream().filter(r -> r.getUnit().equalsIgnoreCase(userUnit)).collect(Collectors.toList());
        }

        pool.sort((a, b) -> {
            boolean gsmMatchA = a.getGsm().equals(req.getGsm());
            boolean gsmMatchB = b.getGsm().equals(req.getGsm());
            if (gsmMatchA != gsmMatchB) return gsmMatchA ? -1 : 1;

            int trimA = a.getWidth() - req.getW();
            int trimB = b.getWidth() - req.getW();
            if (trimA != trimB) return Integer.compare(trimA, trimB);

            return Double.compare(a.getRemaining(), b.getRemaining());
        });

        List<SplitLeg> legs = new ArrayList<>();
        int remainingSheets = req.getSheets();

        for (Reel r : pool) {
            if (remainingSheets <= 0) break;
            int capacity = (int) Math.floor(r.getRemaining() / perSheetKg);
            int take = Math.min(remainingSheets, capacity);
            if (take <= 0) continue;

            double kg = take * perSheetKg;
            double after = r.getRemaining() - kg;
            boolean gsmMatch = r.getGsm().equals(req.getGsm());
            int trim = r.getWidth() - req.getW();

            legs.add(SplitLeg.builder()
                    .reel(r)
                    .sheets(take)
                    .kg(kg)
                    .rem(r.getRemaining())
                    .after(after)
                    .trim(trim)
                    .gsmMatch(gsmMatch)
                    .build());

            remainingSheets -= take;
        }

        return SplitPlanResponse.builder()
                .legs(legs)
                .shortSheets(remainingSheets)
                .feasible(remainingSheets <= 0)
                .perSheetKg(perSheetKg)
                .build();
    }

    @Transactional
    public CuttingJob executeJob(JobCalcRequest req, String operatorName) {
        validateRequest(req, true);
        Reel reel = reelRepository.findById(req.getReelId().trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Reel not found: " + req.getReelId()));

        assertUnitAccess(reel, operatorName);

        JobCalcResponse calc = calculate(req);
        if (!calc.getIsOk()) {
            throw new RuntimeException("Job calculation invalid or insufficient reel balance");
        }

        long count = jobRepository.count();
        String jobNo = "JOB-" + String.format("%03d", count + 1);

        CuttingJob job = CuttingJob.builder()
                .no(jobNo)
                .reel(reel.getId())
                .unit(reel.getUnit())
                .w(req.getW())
                .l(req.getL())
                .gsm(req.getGsm())
                .sheets(req.getSheets())
                .corr(req.getCorr())
                .f(req.getF() != null ? req.getF() : 0.45)
                .effGsm(calc.getEffGsm())
                .kg(calc.getKg())
                .waste(calc.getWaste())
                .totalKg(calc.getTotalKg())
                .after(calc.getAfterBalance())
                .date(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .time(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .status("Completed")
                .op(operatorName != null ? operatorName : "Operator")
                .build();

        // Update reel balance
        double prevRemaining = reel.getRemaining();
        reel.setRemaining(calc.getAfterBalance());
        if (reel.getRemaining() < 1) {
            reel.setStatus("EXHAUSTED");
        }
        
        // Low balance notification (crosses 25% threshold)
        double originalWeight = reel.getOrig() != null ? reel.getOrig() : 0.0;
        if (originalWeight > 0) {
            double threshold = originalWeight * 0.25;
            if (prevRemaining >= threshold && reel.getRemaining() < threshold) {
                notificationService.createNotification("Low Balance Alert", "Reel " + reel.getId() + " is now below 25% balance.", "ALL");
            }
        }
        
        reelRepository.save(reel);

        CuttingJob saved = jobRepository.save(job);

        // Record ledger entry
        LedgerEntry entry = new LedgerEntry();
        entry.setReelId(reel.getId());
        entry.setReferenceType("JOB");
        entry.setReferenceId(jobNo);
        entry.setAmount(BigDecimal.valueOf(calc.getTotalKg()).negate());
        entry.setBalanceAfter(BigDecimal.valueOf(calc.getAfterBalance()));
        entry.setCreatedBy(operatorName != null ? operatorName : "Operator");
        entry.setDescription("Cutting job " + jobNo + " completed (" + calc.getKg() + "kg output, " + calc.getWaste() + "kg waste)");
        entry.setTimestamp(java.time.Instant.now());
        ledgerEntryRepository.save(entry);

        // Activity log
        activityLogRepository.save(ActivityLog.builder()
                .icon("scissors")
                .tone("ok")
                .title("Job completed")
                .sub(reel.getId() + " · " + String.format("%.3f", calc.getKg()) + " kg consumed")
                .time("Just now")
                .build());

        return saved;
    }

    @Transactional
    public List<CuttingJob> executeSplitJob(JobCalcRequest req, String operatorName) {
        validateRequest(req, false);
        SplitPlanResponse plan = getSplitPlan(req, unitForUser(operatorName));
        if (!plan.getFeasible()) {
            throw new RuntimeException("Split job is not feasible with current stock");
        }

        List<CuttingJob> createdJobs = new ArrayList<>();
        boolean wasteAssigned = false;
        for (SplitLeg leg : plan.getLegs()) {
            JobCalcRequest legReq = JobCalcRequest.builder()
                    .reelId(leg.getReel().getId())
                    .w(req.getW())
                    .l(req.getL())
                    .gsm(req.getGsm())
                    .sheets(leg.getSheets())
                    .corr(req.getCorr())
                    .f(req.getF())
                    .waste(!wasteAssigned ? req.getWaste() : 0.0)
                    .build();

            wasteAssigned = true;
            CuttingJob job = executeJob(legReq, operatorName);
            createdJobs.add(job);
        }
        return createdJobs;
    }

    @Transactional
    public CuttingJob reverseJob(String jobId, String operatorName) {
        CuttingJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        if (Boolean.TRUE.equals(job.getReversed())) {
            throw new RuntimeException("Job is already reversed");
        }

        Reel reel = reelRepository.findById(job.getReel())
                .orElseThrow(() -> new RuntimeException("Reel not found for this job"));

        assertUnitAccess(reel, operatorName);

        // Reverse the job
        job.setReversed(true);
        job.setReversedBy(operatorName);
        job.setStatus("Reversed");
        CuttingJob savedJob = jobRepository.save(job);

        // Restore reel balance
        double prevRemaining = reel.getRemaining();
        double restoredKg = job.getTotalKg();
        reel.setRemaining(prevRemaining + restoredKg);
        if (reel.getRemaining() > 0 && "EXHAUSTED".equals(reel.getStatus())) {
            reel.setStatus("AVAILABLE"); // Or LOW_STOCK depending on original weight
            if (reel.getOrig() != null && reel.getRemaining() < reel.getOrig() * 0.25) {
                reel.setStatus("LOW_STOCK");
            }
        }
        reelRepository.save(reel);

        // Record reversal ledger entry
        LedgerEntry entry = new LedgerEntry();
        entry.setReelId(reel.getId());
        entry.setReferenceType("JOB_REV");
        entry.setReferenceId(jobId);
        entry.setAmount(BigDecimal.valueOf(restoredKg));
        entry.setBalanceAfter(BigDecimal.valueOf(reel.getRemaining()));
        entry.setCreatedBy(operatorName != null ? operatorName : "Operator");
        entry.setDescription("Cutting job " + jobId + " reversed (Restored " + restoredKg + "kg)");
        entry.setTimestamp(java.time.Instant.now());
        ledgerEntryRepository.save(entry);

        // Activity log
        activityLogRepository.save(ActivityLog.builder()
                .icon("rotate-ccw")
                .tone("warn")
                .title("Job Reversed")
                .sub(jobId + " reversed by " + operatorName)
                .time("Just now")
                .build());

        return savedJob;
    }

    private void validateRequest(JobCalcRequest req, boolean requiresReel) {
        if (req == null || req.getW() == null || req.getL() == null || req.getGsm() == null
                || req.getSheets() == null || req.getW() <= 0 || req.getL() <= 0
                || req.getGsm() <= 0 || req.getSheets() <= 0) {
            throw new IllegalArgumentException("Width, length, GSM, and sheets must be positive");
        }
        if (req.getF() != null && (req.getF() < 0 || req.getF() > 1)) {
            throw new IllegalArgumentException("Correction factor must be between 0 and 1");
        }
        if (requiresReel && (req.getReelId() == null || req.getReelId().trim().isEmpty())) {
            throw new IllegalArgumentException("A reel is required to execute a job");
        }
    }

    private void assertUnitAccess(Reel reel, String username) {
        String unit = unitForUser(username);
        if (unit != null && !unit.equalsIgnoreCase(reel.getUnit())) {
            throw new IllegalArgumentException("You can only operate reels in your assigned unit");
        }
    }

    private String unitForUser(String username) {
        if (username == null) return null;
        return userRepository.findByUsernameIgnoreCase(username)
                .filter(user -> user.getRole() != Role.ADMIN)
                .map(User::getUnitId)
                .orElse(null);
    }
}
