package com.reeltrack.controller;

import com.reeltrack.model.StockCount;
import com.reeltrack.model.StockCountLine;
import com.reeltrack.service.StockCountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-counts")
public class StockCountController {

    private final StockCountService stockCountService;

    public StockCountController(StockCountService stockCountService) {
        this.stockCountService = stockCountService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<StockCount>> getAll(@RequestParam(required = false) String unit) {
        return ResponseEntity.ok(stockCountService.getAllStockCounts(unit));
    }

    @GetMapping("/unit/{unitId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<StockCount>> getByUnit(@PathVariable String unitId) {
        return ResponseEntity.ok(stockCountService.getAllStockCounts(unitId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<StockCount> getById(@PathVariable String id) {
        return ResponseEntity.ok(stockCountService.getStockCount(id));
    }

    @GetMapping("/{id}/lines")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<StockCountLine>> getLines(@PathVariable String id) {
        StockCount sc = stockCountService.getStockCount(id);
        return ResponseEntity.ok(sc.getLines() != null ? sc.getLines() : List.of());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<StockCount> openStockCount(@RequestBody OpenRequest req, Authentication authentication) {
        String byUser = authentication != null ? authentication.getName() : "Admin";
        String unit = req != null && req.unitId() != null ? req.unitId() : "U1";
        return ResponseEntity.ok(stockCountService.initiateStockCount(unit, byUser));
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<StockCount> initiate(@RequestParam String unit, Authentication authentication) {
        String byUser = authentication != null ? authentication.getName() : "Admin";
        return ResponseEntity.ok(stockCountService.initiateStockCount(unit, byUser));
    }

    @PutMapping("/{id}/lines")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<StockCount> updateLines(@PathVariable String id, @RequestBody List<StockCountLine> lines) {
        return ResponseEntity.ok(stockCountService.updateCountLines(id, lines));
    }

    @PatchMapping("/{id}/lines/{lineId}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<?> recordCountedWeight(
            @PathVariable String id,
            @PathVariable Long lineId,
            @RequestBody CountLineRequest request
    ) {
        StockCount sc = stockCountService.getStockCount(id);
        if (sc.getLines() != null) {
            for (StockCountLine line : sc.getLines()) {
                if (line.getId() != null && line.getId().equals(lineId)) {
                    if (request.countedWeightKg() != null) {
                        line.setActualKg(request.countedWeightKg().doubleValue());
                        if (line.getExpectedKg() != null) {
                            line.setVarianceKg(request.countedWeightKg().doubleValue() - line.getExpectedKg());
                        }
                    }
                    if (request.reason() != null) {
                        line.setReason(request.reason());
                    }
                    break;
                }
            }
            stockCountService.updateCountLines(id, sc.getLines());
        }
        return ResponseEntity.ok(sc);
    }

    @PostMapping("/{id}/post")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockCount> postStockCount(@PathVariable String id, Authentication authentication) {
        String byUser = authentication != null ? authentication.getName() : "Admin";
        return ResponseEntity.ok(stockCountService.reconcileCount(id, byUser));
    }

    @PostMapping("/{id}/reconcile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockCount> reconcile(@PathVariable String id, Authentication authentication) {
        String byUser = authentication != null ? authentication.getName() : "Admin";
        return ResponseEntity.ok(stockCountService.reconcileCount(id, byUser));
    }

    public record OpenRequest(String unitId) {}
    public record CountLineRequest(BigDecimal countedWeightKg, String reason) {}
}
