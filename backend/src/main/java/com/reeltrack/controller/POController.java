package com.reeltrack.controller;

import com.reeltrack.dto.DTOs.*;
import com.reeltrack.model.PurchaseOrder;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.PORepository;
import com.reeltrack.service.POService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pos")
public class POController {

    private final PORepository poRepository;
    private final POService poService;

    public POController(PORepository poRepository, POService poService) {
        this.poRepository = poRepository;
        this.poService = poService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPOs(@RequestParam(required = false) String unit,
                                                          @RequestParam(required = false) String supplier,
                                                          @RequestParam(required = false) String status) {
        if (status != null && !status.trim().isEmpty()) {
            return ResponseEntity.ok(poRepository.findByStatus(status.trim()));
        }
        if (supplier != null && !supplier.trim().isEmpty()) {
            return ResponseEntity.ok(poRepository.findBySupplier(supplier.trim()));
        }
        if (unit != null && !unit.trim().isEmpty()) {
            return ResponseEntity.ok(poRepository.findByUnit(unit.trim()));
        }
        return ResponseEntity.ok(poRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPOById(@PathVariable String id) {
        return poRepository.findById(id.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createPO(@RequestBody POCreateRequest request, Authentication authentication) {
        String raisedBy = authentication != null ? authentication.getName() + " (Head Office)" : "Admin (Head Office)";
        return ResponseEntity.ok(poService.createPO(request, raisedBy));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrder> approvePO(@PathVariable String id) {
        return ResponseEntity.ok(poService.approvePO(id.toUpperCase()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrder> cancelPO(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Cancelled by admin";
        return ResponseEntity.ok(poService.cancelPO(id.toUpperCase(), reason));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<Reel> receiveReel(@PathVariable String id, @RequestBody ReceiveReelRequest request) {
        return ResponseEntity.ok(poService.receiveReel(id.toUpperCase(), request));
    }
}
