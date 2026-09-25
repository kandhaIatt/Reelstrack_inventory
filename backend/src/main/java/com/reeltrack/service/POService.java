package com.reeltrack.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.reeltrack.dto.DTOs.POCreateRequest;
import com.reeltrack.dto.DTOs.ReceiveReelRequest;
import com.reeltrack.model.ActivityLog;
import com.reeltrack.model.BusinessConfig;
import com.reeltrack.model.POItem;
import com.reeltrack.model.PurchaseOrder;
import com.reeltrack.model.Reel;
import com.reeltrack.model.Supplier;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.BusinessConfigRepository;
import com.reeltrack.repository.PORepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.SupplierRepository;
import com.reeltrack.repository.UnitRepository;
import com.reeltrack.model.Unit;

@Service
public class POService {

    private final PORepository poRepository;
    private final ReelRepository reelRepository;
    private final SupplierRepository supplierRepository;
    private final UnitRepository unitRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BusinessConfigRepository businessConfigRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public POService(PORepository poRepository, ReelRepository reelRepository,
                     SupplierRepository supplierRepository, UnitRepository unitRepository, ActivityLogRepository activityLogRepository,
                     BusinessConfigRepository businessConfigRepository, EmailService emailService,
                     NotificationService notificationService) {
        this.poRepository = poRepository;
        this.reelRepository = reelRepository;
        this.supplierRepository = supplierRepository;
        this.unitRepository = unitRepository;
        this.activityLogRepository = activityLogRepository;
        this.businessConfigRepository = businessConfigRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PurchaseOrder createPO(POCreateRequest req, String raisedBy) {
        validateCreateRequest(req);
        
        Supplier supplier = supplierRepository.findById(req.getSupplier())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        Unit unit = unitRepository.findById(req.getUnit())
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        long count = poRepository.count();
        String poId = "PO-2026-" + String.format("%04d", 48 + count);

        // Basic GST validation on Supplier
        String gst = supplier.getGst();
        if (gst == null || gst.length() < 2) {
             throw new RuntimeException("Supplier GST is invalid or missing");
        }
        
        String supplierStateCode = gst.substring(0, 2);
        String unitStateCode = unit.getStateCode();
        if (unitStateCode == null || unitStateCode.length() < 2) {
            throw new RuntimeException("Unit state code is invalid or missing");
        }

        boolean isInterState = !supplierStateCode.equals(unitStateCode);
        
        // Let's assume GST rate is 18% (0.18).
        double gstRate = 0.18;  
        
        // Calculate items total
        double totalBase = 0.0;
        if (req.getItems() != null) {
            for (POItem item : req.getItems()) {
                double itemTotal = (item.getKg() != null ? item.getKg() : 0.0) * (item.getRate() != null ? item.getRate() : 0.0);
                double itemGstAmount = itemTotal * gstRate;
                
                if (isInterState) {
                    item.setIgst(itemGstAmount);
                    item.setCgst(0.0);
                    item.setSgst(0.0);
                } else {
                    item.setIgst(0.0);
                    item.setCgst(itemGstAmount / 2);
                    item.setSgst(itemGstAmount / 2);
                }
                item.setTotalTax(itemGstAmount);
                
                totalBase += itemTotal;
            }
        }
        
        double gstAmount = totalBase * gstRate;
        double totalWithGst = totalBase + gstAmount;

        double totalCgst = isInterState ? 0.0 : gstAmount / 2;
        double totalSgst = isInterState ? 0.0 : gstAmount / 2;
        double totalIgst = isInterState ? gstAmount : 0.0;

        PurchaseOrder po = PurchaseOrder.builder()
                .id(poId)
                .supplier(req.getSupplier())
                .unit(req.getUnit())
                .date(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .eta(req.getEta())
                .terms(req.getTerms())
                .status("Pending Approval")
                .received(0)
                .raisedBy(raisedBy != null ? raisedBy : "Admin (Head Office)")
                .gstRate(gstRate)
                .totalTax(gstAmount)
                .totalWithGst(totalWithGst)
                .cgst(totalCgst)
                .sgst(totalSgst)
                .igst(totalIgst)
                .supplierState(supplierStateCode)
                .items(req.getItems())
                .build();

        PurchaseOrder saved = poRepository.save(po);

        String supName = supplier.getName();

        activityLogRepository.save(ActivityLog.builder()
                .icon("po")
                .tone("warn")
                .title(poId + " created")
                .sub(supName)
                .time("Just now")
                .build());

        emailService.sendEmail("supplier@example.com", "New Purchase Order: " + poId, 
            "A new purchase order (" + poId + ") has been raised. Please review the details.");
        
        notificationService.createNotification("PO Created", "Purchase Order " + poId + " has been raised for " + supName, "ADMIN");

        return saved;
    }

    @Transactional
    public PurchaseOrder approvePO(String poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found: " + poId));
        po.setStatus("Open");
        PurchaseOrder saved = poRepository.save(po);

        activityLogRepository.save(ActivityLog.builder()
                .icon("po")
                .tone("ok")
                .title("PO approved")
                .sub(poId)
                .time("Just now")
                .build());

        emailService.sendEmail("supplier@example.com", "Purchase Order Approved: " + poId, 
            "The purchase order " + poId + " has been approved and is now Open.");
            
        notificationService.createNotification("PO Approved", "Purchase Order " + poId + " has been approved.", "ALL");

        return saved;
    }

    @Transactional
    public PurchaseOrder cancelPO(String poId, String reason) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found: " + poId));
        po.setStatus("Cancelled");
        po.setNotes(reason != null ? reason : "Cancelled by admin");
        PurchaseOrder saved = poRepository.save(po);

        activityLogRepository.save(ActivityLog.builder()
                .icon("po")
                .tone("danger")
                .title("PO cancelled")
                .sub(poId)
                .time("Just now")
                .build());

        emailService.sendEmail("supplier@example.com", "Purchase Order Cancelled: " + poId, 
            "The purchase order " + poId + " has been cancelled. Reason: " + reason);

        return saved;
    }

    @Transactional
    public Reel receiveReel(String poId, ReceiveReelRequest req) {
        if (req == null || req.getKg() == null || req.getKg() <= 0
                || req.getGsm() == null || req.getGsm() <= 0
                || req.getWidth() == null || req.getWidth() <= 0
                || req.getType() == null || req.getType().isBlank()
                || req.getMill() == null || req.getMill().isBlank()) {
            throw new IllegalArgumentException("Reel type, mill, GSM, width, and positive weight are required");
        }
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found: " + poId));

        int totalReels = po.getItems().stream().mapToInt(POItem::getQty).sum();
        if (po.getReceived() != null && po.getReceived() >= totalReels) {
            throw new IllegalArgumentException("All reels for this purchase order have already been received");
        }

        String reelId = nextReelId();

        Reel reel = Reel.builder()
                .id(reelId)
                .type(req.getType())
                .gsm(req.getGsm())
                .bf(req.getBf())
                .width(req.getWidth())
                .orig(req.getKg())
                .remaining(req.getKg())
                .mill(req.getMill())
                .unit(req.getUnit() != null ? req.getUnit() : po.getUnit())
                .rec(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .po(poId)
                .build();

        Reel savedReel = reelRepository.save(reel);

        po.setReceived(po.getReceived() + 1);
        boolean wasCompleted = "Completed".equals(po.getStatus());
        if (po.getReceived() >= totalReels) {
            po.setStatus("Completed");
            if (!wasCompleted) {
                emailService.sendEmail("supplier@example.com", "Purchase Order Completed: " + poId, 
                    "All goods for purchase order " + poId + " have been received successfully.");
            }
        } else {
            po.setStatus("Partially Received");
        }
        poRepository.save(po);

        activityLogRepository.save(ActivityLog.builder()
                .icon("truck")
                .tone("violet")
                .title("Reel " + reelId + " received")
                .sub(String.format("%.0f", req.getKg()) + " kg · " + poId)
                .time("Just now")
                .build());

        return savedReel;
    }

    private void validateCreateRequest(POCreateRequest req) {
        List<POItem> items = req != null ? req.getItems() : null;
        if (req == null || req.getSupplier() == null || req.getSupplier().isBlank()
                || req.getUnit() == null || req.getUnit().isBlank() || items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Supplier, unit, and at least one PO item are required");
        }
        for (POItem item : items) {
            if (item == null || item.getQty() == null || item.getQty() <= 0
                    || item.getKg() == null || item.getKg() <= 0
                    || item.getRate() == null || item.getRate() < 0
                    || item.getGsm() == null || item.getGsm() <= 0
                    || item.getWidth() == null || item.getWidth() <= 0
                    || item.getType() == null || item.getType().isBlank()) {
                throw new IllegalArgumentException("Each PO item must have valid type, GSM, width, quantity, weight, and rate");
            }
        }
    }

    private String nextReelId() {
        int nextNumber = reelRepository.findTopByOrderByIdDesc()
                .map(Reel::getId)
                .map(this::reelNumber)
                .orElse(21078) + 1;

        BusinessConfig config = businessConfigRepository.findById("DEFAULT")
                .orElse(new BusinessConfig());
        String formatPattern = config.getReelNumberFormat();

        String candidate;
        do {
            String seqStr = String.valueOf(nextNumber++);
            if (formatPattern != null && formatPattern.contains("{SEQ}")) {
                candidate = formatPattern.replace("{SEQ}", seqStr);
            } else {
                candidate = "R-" + seqStr;
            }
        } while (reelRepository.existsById(candidate));

        return candidate;
    }

    private int reelNumber(String reelId) {
        try {
            // Extract digits from reelId
            String digits = reelId.replaceAll("\\D+", "");
            return Integer.parseInt(digits);
        } catch (RuntimeException ignored) {
            return 21078;
        }
    }
}
