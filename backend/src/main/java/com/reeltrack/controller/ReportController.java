package com.reeltrack.controller;

import com.reeltrack.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/daily-stock/pdf")
    public ResponseEntity<byte[]> getDailyStockPdf(Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "Admin";
            byte[] pdf = reportService.generateDailyStockStatementPdf(username);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=daily_stock.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/production-plan/pdf")
    public ResponseEntity<byte[]> getProductionPlanPdf(Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "Admin";
            byte[] pdf = reportService.generateProductionPlanPdf(username);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=production_plan.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ledger-history/excel")
    public ResponseEntity<byte[]> getLedgerHistoryExcel(Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "Admin";
            byte[] excel = reportService.generateLedgerHistoryExcel(username);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ledger_history.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/po-summary/excel")
    public ResponseEntity<byte[]> getPOSummaryExcel(Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "Admin";
            byte[] excel = reportService.generatePOSummaryExcel(username);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=po_summary.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
