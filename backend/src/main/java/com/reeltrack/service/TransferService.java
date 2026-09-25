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
        private final com.reeltrack.repository.LedgerEntryRepository ledgerEntryRepository;

        public TransferService(ReelRepository reelRepository, TransferRepository transferRepository,
                                                   ActivityLogRepository activityLogRepository,
                                                   com.reeltrack.repository.LedgerEntryRepository ledgerEntryRepository) {
                this.reelRepository = reelRepository;
                this.transferRepository = transferRepository;
                this.activityLogRepository = activityLogRepository;
                this.ledgerEntryRepository = ledgerEntryRepository;
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
                if ("Consumed".equalsIgnoreCase(reel.getStatus()) || "In Transit".equalsIgnoreCase(reel.getStatus())) {
                        throw new IllegalArgumentException("Cannot transfer a reel that is " + reel.getStatus());
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
                .status("DISPATCHED")
                .build();

        // Mark reel as in transit
        reel.setStatus("In Transit");
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

    @Transactional
    public Transfer receiveTransfer(Long transferId, String byUser) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));
        
        if (!"DISPATCHED".equals(transfer.getStatus())) {
            throw new IllegalArgumentException("Transfer is not in DISPATCHED status");
        }

        Reel reel = reelRepository.findById(transfer.getReel())
                .orElseThrow(() -> new RuntimeException("Reel not found: " + transfer.getReel()));

        transfer.setStatus("RECEIVED");
        transferRepository.save(transfer);

        reel.setStatus("Available");
        reel.setUnit(transfer.getToUnit());
        reelRepository.save(reel);

        activityLogRepository.save(ActivityLog.builder()
                .icon("check")
                .tone("ok")
                .title("Reel " + reel.getId() + " received")
                .sub("at " + transfer.getToUnit())
                .time("Just now")
                .build());
        
        com.reeltrack.model.LedgerEntry entry = new com.reeltrack.model.LedgerEntry();
        entry.setReelId(reel.getId());
        entry.setDescription("Received from transfer " + transfer.getRef());
        entry.setAmount(java.math.BigDecimal.ZERO);
        entry.setBalanceAfter(java.math.BigDecimal.valueOf(reel.getRemaining()));
        entry.setReferenceType("TRANSFER");
        entry.setReferenceId(transfer.getRef());
        entry.setCreatedBy(byUser);
        ledgerEntryRepository.save(entry);

        return transfer;
    }

    @Transactional
    public Transfer rejectTransfer(Long transferId, String byUser, String notes) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));
        
        if (!"DISPATCHED".equals(transfer.getStatus())) {
            throw new IllegalArgumentException("Transfer is not in DISPATCHED status");
        }

        Reel reel = reelRepository.findById(transfer.getReel())
                .orElseThrow(() -> new RuntimeException("Reel not found: " + transfer.getReel()));

        transfer.setStatus("REJECTED");
        transfer.setNotes(transfer.getNotes() + " | Rejection Notes: " + notes);
        transferRepository.save(transfer);

        reel.setStatus("Available");
        // Revert to original unit since it was rejected
        reel.setUnit(transfer.getFromUnit());
        reelRepository.save(reel);

        activityLogRepository.save(ActivityLog.builder()
                .icon("x")
                .tone("danger")
                .title("Transfer rejected for " + reel.getId())
                .sub("Reverted to " + transfer.getFromUnit())
                .time("Just now")
                .build());
        
        com.reeltrack.model.LedgerEntry entry = new com.reeltrack.model.LedgerEntry();
        entry.setReelId(reel.getId());
        entry.setDescription("Transfer " + transfer.getRef() + " rejected. " + notes);
        entry.setAmount(java.math.BigDecimal.ZERO);
        entry.setBalanceAfter(java.math.BigDecimal.valueOf(reel.getRemaining()));
        entry.setReferenceType("TRANSFER_REJECT");
        entry.setReferenceId(transfer.getRef());
        entry.setCreatedBy(byUser);
        ledgerEntryRepository.save(entry);

        return transfer;
    }
}
