package com.reeltrack.service;

import com.reeltrack.model.Reel;
import com.reeltrack.model.StockCount;
import com.reeltrack.model.StockCountLine;
import com.reeltrack.model.LedgerEntry;
import com.reeltrack.model.ActivityLog;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.StockCountRepository;
import com.reeltrack.repository.LedgerEntryRepository;
import com.reeltrack.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockCountService {

    private final StockCountRepository stockCountRepository;
    private final ReelRepository reelRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ActivityLogRepository activityLogRepository;

    public StockCountService(StockCountRepository stockCountRepository, ReelRepository reelRepository,
                             LedgerEntryRepository ledgerEntryRepository, ActivityLogRepository activityLogRepository) {
        this.stockCountRepository = stockCountRepository;
        this.reelRepository = reelRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public List<StockCount> getAllStockCounts(String unit) {
        if (unit != null && !unit.isEmpty()) {
            return stockCountRepository.findByUnit(unit);
        }
        return stockCountRepository.findAll();
    }

    public StockCount getStockCount(String id) {
        return stockCountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock count not found: " + id));
    }

    @Transactional
    public StockCount initiateStockCount(String unitId, String createdBy) {
        List<Reel> reels = reelRepository.findByUnit(unitId);
        
        StockCount count = new StockCount();
        long c = stockCountRepository.count();
        count.setId("SC-" + (c + 1));
        count.setUnit(unitId);
        count.setStatus("IN_PROGRESS");
        count.setInitiatedBy(createdBy);
        count.setDate(LocalDateTime.now().toString());
        
        List<StockCountLine> lines = reels.stream().map(reel -> {
            StockCountLine line = new StockCountLine();
            line.setReelId(reel.getId());
            line.setExpectedKg(reel.getWeight() != null ? reel.getWeight().doubleValue() : 0.0);
            return line;
        }).collect(Collectors.toList());
        
        count.setLines(lines);
        return stockCountRepository.save(count);
    }

    @Transactional
    public StockCount updateCountLines(String id, List<StockCountLine> updatedLines) {
        StockCount count = getStockCount(id);
        if (!"IN_PROGRESS".equals(count.getStatus())) {
            throw new RuntimeException("Cannot update a completed or cancelled count");
        }
        
        for (StockCountLine ul : updatedLines) {
            for (StockCountLine sl : count.getLines()) {
                if (sl.getReelId().equals(ul.getReelId())) {
                    sl.setActualKg(ul.getActualKg());
                    if (ul.getActualKg() != null && sl.getExpectedKg() != null) {
                        sl.setVarianceKg(ul.getActualKg() - sl.getExpectedKg());
                    }
                    break;
                }
            }
        }
        return stockCountRepository.save(count);
    }

    @Transactional
    public StockCount reconcileCount(String id, String byUser) {
        StockCount count = getStockCount(id);
        if (!"IN_PROGRESS".equals(count.getStatus())) {
            throw new RuntimeException("Cannot reconcile a count that is not in progress");
        }
        
        for (StockCountLine sl : count.getLines()) {
            if (sl.getActualKg() != null && sl.getVarianceKg() != null && sl.getVarianceKg() != 0.0) {
                // Adjust reel
                Reel reel = reelRepository.findById(sl.getReelId()).orElse(null);
                if (reel != null) {
                    BigDecimal oldWeight = reel.getWeight();
                    reel.setWeight(BigDecimal.valueOf(sl.getActualKg()));
                    reelRepository.save(reel);
                    
                    // Ledger entry
                    LedgerEntry entry = new LedgerEntry();
                    entry.setReelId(reel.getId());
                    entry.setDescription("Stock count reconciliation adjustment");
                    entry.setAmount(BigDecimal.valueOf(sl.getVarianceKg()));
                    entry.setBalanceAfter(BigDecimal.valueOf(sl.getActualKg()));
                    entry.setReferenceType("STOCK_COUNT");
                    entry.setReferenceId(count.getId());
                    entry.setCreatedBy(byUser);
                    ledgerEntryRepository.save(entry);
                }
            }
        }
        
        count.setStatus("COMPLETED");
        count.setDate(LocalDateTime.now().toString());
        
        activityLogRepository.save(ActivityLog.builder()
                .icon("clipboard-check")
                .tone("ok")
                .title("Stock Count Completed")
                .sub("Unit: " + count.getUnit())
                .time("Just now")
                .build());
        
        return stockCountRepository.save(count);
    }
}
