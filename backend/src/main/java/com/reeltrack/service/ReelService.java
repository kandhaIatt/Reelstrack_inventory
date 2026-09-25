package com.reeltrack.service;

import com.reeltrack.dto.AddReelsRequest;
import com.reeltrack.model.LedgerEntry;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.LedgerEntryRepository;
import com.reeltrack.repository.ReelRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Validated
public class ReelService {

    private final ReelRepository reelRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public ReelService(ReelRepository reelRepository, LedgerEntryRepository ledgerEntryRepository) {
        this.reelRepository = reelRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Transactional
    public List<Reel> addReels(AddReelsRequest request, String addedBy) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (isBlank(request.getMill())) {
            throw new IllegalArgumentException("Mill is required");
        }
        if (isBlank(request.getUnit())) {
            throw new IllegalArgumentException("Holding unit is required");
        }
        if (isBlank(request.getType())) {
            throw new IllegalArgumentException("Reel type is required");
        }
        if (request.getGsm() == null || request.getGsm() <= 0) {
            throw new IllegalArgumentException("GSM must be greater than zero");
        }
        if (request.getWidth() == null || request.getWidth() <= 0) {
            throw new IllegalArgumentException("Width must be greater than zero");
        }
        if (isBlank(request.getSource())) {
            throw new IllegalArgumentException("Reason is required");
        }

        String poNumber = null;
        if ("Against PO".equalsIgnoreCase(request.getSource().trim())) {
            if (isBlank(request.getPoNumber())) {
                throw new IllegalArgumentException("PO Number is required when the reason is Against PO");
            }
            poNumber = request.getPoNumber().trim();
        }

        if (request.getDate() == null) {
            throw new IllegalArgumentException("Received date is required");
        }

        if ("Other".equalsIgnoreCase(request.getSource().trim()) && isBlank(request.getNote())) {
            throw new IllegalArgumentException("A note is required when the reason is Other");
        }

        if (request.getRate() != null && request.getRate() < 0) {
            throw new IllegalArgumentException("Rate cannot be negative");
        }

        if (request.getReels() == null || request.getReels().isEmpty()) {
            throw new IllegalArgumentException("At least one reel must be provided");
        }

        String receivedDate = request.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        List<Reel> reelsToSave = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();

        for (int i = 0; i < request.getReels().size(); i++) {
            AddReelsRequest.ReelItem item = request.getReels().get(i);
            if (item == null || isBlank(item.getId())) {
                throw new IllegalArgumentException("Reel number is missing on row " + (i + 1));
            }

            String reelId = item.getId().trim().toUpperCase();

            if (!seenIds.add(reelId)) {
                throw new IllegalArgumentException("Duplicate reel ID in request: " + reelId);
            }

            if (reelRepository.existsById(reelId)) {
                throw new IllegalArgumentException("Reel ID already exists in database: " + reelId);
            }

            if (item.getWeight() == null || item.getWeight() <= 0) {
                throw new IllegalArgumentException("Weight must be greater than zero for reel " + reelId);
            }

            Reel reel = Reel.builder()
                    .id(reelId)
                    .type(request.getType().trim())
                    .gsm(request.getGsm())
                    .bf(request.getBf())
                    .width(request.getWidth())
                    .orig(item.getWeight())
                    .remaining(item.getWeight())
                    .mill(request.getMill().trim())
                    .unit(request.getUnit().trim())
                    .rec(receivedDate)
                    .po(poNumber)
                    .source(request.getSource().trim())
                    .supplier(isBlank(request.getSupplier()) ? null : request.getSupplier().trim())
                    .rate(request.getRate())
                    .note(isBlank(request.getNote()) ? null : request.getNote().trim())
                    .addedBy(addedBy)
                    .build();

            reel.setWeight(java.math.BigDecimal.valueOf(item.getWeight()));
            reel.setStatus("AVAILABLE");
            reel.setActive(true);

            reelsToSave.add(reel);
        }

        List<Reel> savedReels = reelRepository.saveAll(reelsToSave);

        List<LedgerEntry> ledgers = new ArrayList<>();
        for (Reel reel : savedReels) {
            LedgerEntry ledger = new LedgerEntry();
            ledger.setReelId(reel.getId());
            ledger.setDescription("Initial Stock: " + request.getSource().trim());
            ledger.setAmount(java.math.BigDecimal.valueOf(reel.getOrig()));
            ledger.setBalanceAfter(java.math.BigDecimal.valueOf(reel.getOrig()));
            ledger.setReferenceType("INITIAL_STOCK");
            ledger.setCreatedBy(addedBy);
            ledgers.add(ledger);
        }
        ledgerEntryRepository.saveAll(ledgers);

        return savedReels;
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public List<Reel> getAll(Optional<String> unit) {
        return unit.map(reelRepository::findByUnit).orElseGet(reelRepository::findAll);
    }

    public List<Reel> search(String unit, String mill, String type, Boolean active) {
        return reelRepository.findAll((root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (unit != null && !unit.isBlank()) predicates.add(cb.equal(root.get("unit"), unit));
            if (mill != null && !mill.isBlank()) predicates.add(cb.equal(root.get("mill"), mill));
            if (type != null && !type.isBlank()) predicates.add(cb.equal(root.get("type"), type));
            if (active != null) predicates.add(cb.equal(root.get("active"), active));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        });
    }

    public Optional<Reel> getById(String id) {
        return reelRepository.findById(id);
    }

    public Reel create(Reel reel) {
        // Generate a simple ID if not provided (retain existing pattern)
        if (reel.getId() == null || reel.getId().isBlank()) {
            long count = reelRepository.count();
            reel.setId("R" + (count + 1));
        }
        return reelRepository.save(reel);
    }

    @Transactional
    public List<Reel> bulkCreate(List<Reel> reels) {
        long count = reelRepository.count();
        for (Reel reel : reels) {
            if (reel.getId() == null || reel.getId().isBlank()) {
                count++;
                reel.setId("R" + count);
            }
        }
        return reelRepository.saveAll(reels);
    }

    @Transactional
    public Optional<Reel> update(String id, Reel details) {
        return reelRepository.findById(id).map(existing -> {
            if (details.getName() != null) existing.setName(details.getName());
            if (details.getWeight() != null) existing.setWeight(details.getWeight());
            if (details.getActive() != null) existing.setActive(details.getActive());
            // Additional fields can be merged here as needed
            return reelRepository.save(existing);
        });
    }

    @Transactional
    public Optional<Reel> toggleActive(String id) {
        return reelRepository.findById(id).map(r -> {
            r.setActive(!Boolean.TRUE.equals(r.getActive()));
            return reelRepository.save(r);
        });
    }

    @Transactional
    public Optional<Reel> adjustWeight(String id, java.math.BigDecimal newWeight, Boolean force) {
        return reelRepository.findById(id).map(r -> {
            java.math.BigDecimal currentWeight = r.getWeight();
            if (newWeight == null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "New weight must be provided");
            }
            if (newWeight.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Weight cannot be negative");
            }
            java.math.BigDecimal originalWeight = r.getOrig() != null ? java.math.BigDecimal.valueOf(r.getOrig()) : java.math.BigDecimal.ZERO;
            if (newWeight.compareTo(originalWeight) > 0 && !Boolean.TRUE.equals(force)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "WARNING: New weight is greater than original weight.");
            }
            // compute adjustment amount (new - current)
            java.math.BigDecimal adjustment = newWeight.subtract(currentWeight == null ? java.math.BigDecimal.ZERO : currentWeight);
            r.setWeight(newWeight);
            Reel saved = reelRepository.save(r);
            LedgerEntry entry = new LedgerEntry();
            entry.setReelId(id);
            entry.setDescription("Weight adjusted to " + newWeight);
            entry.setAmount(adjustment);
            entry.setBalanceAfter(newWeight);
            // get authenticated username
            String username = "system";
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                username = auth.getName();
            }
            entry.setCreatedBy(username);
            ledgerEntryRepository.save(entry);
            return saved;
        });
    }

    @Transactional
    public Optional<Reel> updateStatus(String id, String newStatus, String notes) {
        return reelRepository.findById(id).map(r -> {
            r.setStatus(newStatus);
            Reel saved = reelRepository.save(r);
            
            LedgerEntry entry = new LedgerEntry();
            entry.setReelId(id);
            entry.setDescription("Status updated to " + newStatus + (notes != null ? ": " + notes : ""));
            entry.setAmount(java.math.BigDecimal.ZERO);
            entry.setBalanceAfter(r.getWeight());
            
            String username = "system";
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                username = auth.getName();
            }
            entry.setCreatedBy(username);
            ledgerEntryRepository.save(entry);
            
            return saved;
        });
    }

    @Transactional
    public Optional<Reel> applyCorrection(String id, java.math.BigDecimal weightDelta, String notes, Boolean force) {
        return reelRepository.findById(id).map(r -> {
            java.math.BigDecimal currentWeight = r.getWeight() == null ? java.math.BigDecimal.ZERO : r.getWeight();
            java.math.BigDecimal newWeight = currentWeight.add(weightDelta);
            if (newWeight.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Resulting weight cannot be negative");
            }
            java.math.BigDecimal originalWeight = r.getOrig() != null ? java.math.BigDecimal.valueOf(r.getOrig()) : java.math.BigDecimal.ZERO;
            if (newWeight.compareTo(originalWeight) > 0 && !Boolean.TRUE.equals(force)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "WARNING: Resulting weight is greater than original weight.");
            }
            r.setWeight(newWeight);
            Reel saved = reelRepository.save(r);
            
            LedgerEntry entry = new LedgerEntry();
            entry.setReelId(id);
            entry.setDescription("Correction applied" + (notes != null ? ": " + notes : ""));
            entry.setAmount(weightDelta);
            entry.setBalanceAfter(newWeight);
            
            String username = "system";
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                username = auth.getName();
            }
            entry.setCreatedBy(username);
            ledgerEntryRepository.save(entry);
            
            return saved;
        });
    }
}
