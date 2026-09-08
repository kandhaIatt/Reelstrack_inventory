package com.reeltrack.controller;

import com.reeltrack.dto.DTOs.TransferRequest;
import com.reeltrack.model.Transfer;
import com.reeltrack.repository.TransferRepository;
import com.reeltrack.service.TransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferRepository transferRepository;
    private final TransferService transferService;

    public TransferController(TransferRepository transferRepository, TransferService transferService) {
        this.transferRepository = transferRepository;
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<List<Transfer>> getAllTransfers() {
        return ResponseEntity.ok(transferRepository.findAll());
    }

    @GetMapping("/reel/{reelId}")
    public ResponseEntity<List<Transfer>> getTransfersByReel(@PathVariable String reelId) {
        return ResponseEntity.ok(transferRepository.findByReel(reelId.toUpperCase()));
    }

    @PostMapping
    public ResponseEntity<Transfer> createTransfer(@RequestBody TransferRequest request, Authentication authentication) {
        String byUser = authentication != null ? authentication.getName() : "Admin";
        return ResponseEntity.ok(transferService.executeTransfer(request, byUser));
    }
}
