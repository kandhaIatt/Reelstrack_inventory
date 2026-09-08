package com.reeltrack.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.reeltrack.dto.DTOs.TransferRequest;
import com.reeltrack.model.ActivityLog;
import com.reeltrack.model.Reel;
import com.reeltrack.model.Transfer;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.TransferRepository;

@Service
public class TransferService {

        private final ReelRepository reelRepository;
        private final TransferRepository transferRepository;
        private final ActivityLogRepository activityLogRepository;

        public TransferService(ReelRepository reelRepository, TransferRepository transferRepository,
                                                   ActivityLogRepository activityLogRepository) {
                this.reelRepository = reelRepository;
                this.transferRepository = transferRepository;
                this.activityLogRepository = activityLogRepository;
        }

    @Transactional
    public Transfer executeTransfer(TransferRequest req, String byUser) {
                if (req == null || req.getReelId() == null || req.getReelId().trim().isEmpty()
                                || req.getToUnit() == null || req.getToUnit().trim().isEmpty()) {
                        throw new IllegalArgumentException("Reel and destination unit are required");
                }
        Reel reel = reelRepository.findById(req.getReelId())
                .orElseThrow(() -> new RuntimeException("Reel not found: " + req.getReelId()));

        String fromUnit = reel.getUnit();
                String toUnit = req.getToUnit().trim();
                if (fromUnit == null || fromUnit.equalsIgnoreCase(toUnit)) {
                        throw new IllegalArgumentException("Destination unit must differ from source unit");
                }
                if (reel.getRemaining() == null || reel.getRemaining() <= 0) {
                        throw new IllegalArgumentException("Only reels with available stock can be transferred");
                }

        long count = transferRepository.count();
        String ref = req.getRef() != null && !req.getRef().trim().isEmpty()
                ? req.getRef().trim()
                : "TRF-2026-" + String.format("%04d", 92 + count);

        Transfer transfer = Transfer.builder()
                .ref(ref)
                .reel(reel.getId())
                .fromUnit(fromUnit)
                .toUnit(toUnit)
                .kg(reel.getRemaining())
                .date(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .byUser(byUser != null ? byUser : "Admin")
                .notes(req.getNotes())
                .build();

        // Transfer reel
        reel.setUnit(toUnit);
        reelRepository.save(reel);

        Transfer saved = transferRepository.save(transfer);

        activityLogRepository.save(ActivityLog.builder()
                .icon("transfer")
                .tone("info")
                .title("Reel " + reel.getId() + " transferred")
                .sub(fromUnit + " → " + toUnit)
                .time("Just now")
                .build());

        return saved;
    }
}
