package com.reeltrack.service;

import com.reeltrack.model.CuttingJob;
import com.reeltrack.model.LedgerEntry;
import com.reeltrack.model.PurchaseOrder;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.CuttingJobRepository;
import com.reeltrack.repository.LedgerEntryRepository;
import com.reeltrack.repository.PORepository;
import com.reeltrack.repository.ReelRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReelRepository reelRepository;
    private final CuttingJobRepository jobRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final PORepository poRepository;

    public ReportService(ReelRepository reelRepository, CuttingJobRepository jobRepository,
                         LedgerEntryRepository ledgerEntryRepository, PORepository poRepository) {
        this.reelRepository = reelRepository;
        this.jobRepository = jobRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.poRepository = poRepository;
    }

    public byte[] generateDailyStockStatementPdf(String username) throws Exception {
        List<Reel> reels = reelRepository.findAll().stream()
                .filter(r -> "AVAILABLE".equals(r.getStatus()))
                .collect(Collectors.toList());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Daily Stock Statement", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        Map<String, List<Reel>> grouped = reels.stream()
                .collect(Collectors.groupingBy(r -> r.getGsm() + " GSM / " + r.getBf() + " BF"));

        for (Map.Entry<String, List<Reel>> entry : grouped.entrySet()) {
            document.add(new Paragraph("Category: " + entry.getKey(), new Font(Font.HELVETICA, 12, Font.BOLD)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.addCell(new PdfPCell(new Phrase("Reel ID")));
            table.addCell(new PdfPCell(new Phrase("Mill")));
            table.addCell(new PdfPCell(new Phrase("Width (cm)")));
            table.addCell(new PdfPCell(new Phrase("Weight (kg)")));

            double totalWeight = 0;
            for (Reel r : entry.getValue()) {
                table.addCell(r.getId());
                table.addCell(r.getMill());
                table.addCell(String.valueOf(r.getWidth()));
                double w = r.getWeight() != null ? r.getWeight().doubleValue() : (r.getRemaining() != null ? r.getRemaining() : 0.0);
                table.addCell(String.format("%.2f", w));
                totalWeight += w;
            }
            
            PdfPCell totalCell = new PdfPCell(new Phrase("Total:"));
            totalCell.setColspan(3);
            totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(totalCell);
            table.addCell(String.format("%.2f", totalWeight));

            document.add(table);
            document.add(new Paragraph(" "));
        }

        addFooter(document, username);
        document.close();
        return out.toByteArray();
    }

    public byte[] generateProductionPlanPdf(String username) throws Exception {
        List<CuttingJob> jobs = jobRepository.findAll().stream()
                .filter(j -> !"Completed".equals(j.getStatus()))
                .collect(Collectors.toList());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Production Plan", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.addCell(new PdfPCell(new Phrase("Job No")));
        table.addCell(new PdfPCell(new Phrase("Reel")));
        table.addCell(new PdfPCell(new Phrase("Unit")));
        table.addCell(new PdfPCell(new Phrase("Status")));
        table.addCell(new PdfPCell(new Phrase("Total Kg")));

        double grandTotal = 0;
        for (CuttingJob j : jobs) {
            table.addCell(j.getNo());
            table.addCell(j.getReel());
            table.addCell(j.getUnit());
            table.addCell(j.getStatus());
            double k = j.getTotalKg() != null ? j.getTotalKg() : 0.0;
            table.addCell(String.format("%.2f", k));
            grandTotal += k;
        }

        PdfPCell totalCell = new PdfPCell(new Phrase("Grand Total:"));
        totalCell.setColspan(4);
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalCell);
        table.addCell(String.format("%.2f", grandTotal));

        document.add(table);
        addFooter(document, username);
        document.close();
        return out.toByteArray();
    }

    public byte[] generateLedgerHistoryExcel(String username) throws Exception {
        List<LedgerEntry> entries = ledgerEntryRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Ledger History");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Reel ID");
        header.createCell(2).setCellValue("Description");
        header.createCell(3).setCellValue("Amount");
        header.createCell(4).setCellValue("Balance After");
        header.createCell(5).setCellValue("Reference Type");
        header.createCell(6).setCellValue("Reference ID");
        header.createCell(7).setCellValue("Timestamp");
        header.createCell(8).setCellValue("Created By");

        int rowNum = 1;
        for (LedgerEntry e : entries) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(e.getId());
            row.createCell(1).setCellValue(e.getReelId());
            row.createCell(2).setCellValue(e.getDescription());
            row.createCell(3).setCellValue(e.getAmount() != null ? e.getAmount().doubleValue() : 0.0);
            row.createCell(4).setCellValue(e.getBalanceAfter() != null ? e.getBalanceAfter().doubleValue() : 0.0);
            row.createCell(5).setCellValue(e.getReferenceType());
            row.createCell(6).setCellValue(e.getReferenceId());
            row.createCell(7).setCellValue(e.getTimestamp() != null ? e.getTimestamp().toString() : "");
            row.createCell(8).setCellValue(e.getCreatedBy());
        }

        Row footer = sheet.createRow(rowNum + 1);
        footer.createCell(0).setCellValue("Generated by " + username + " at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    public byte[] generatePOSummaryExcel(String username) throws Exception {
        List<PurchaseOrder> pos = poRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("PO Summary");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("PO ID");
        header.createCell(1).setCellValue("Supplier");
        header.createCell(2).setCellValue("Date");
        header.createCell(3).setCellValue("Status");
        header.createCell(4).setCellValue("Items Received");
        header.createCell(5).setCellValue("Total w/ GST");

        int rowNum = 1;
        double grandTotal = 0;
        for (PurchaseOrder po : pos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(po.getId());
            row.createCell(1).setCellValue(po.getSupplier());
            row.createCell(2).setCellValue(po.getDate());
            row.createCell(3).setCellValue(po.getStatus());
            row.createCell(4).setCellValue(po.getReceived() != null ? po.getReceived() : 0);
            double total = po.getTotalWithGst() != null ? po.getTotalWithGst() : 0.0;
            row.createCell(5).setCellValue(total);
            grandTotal += total;
        }

        Row totalRow = sheet.createRow(rowNum++);
        totalRow.createCell(4).setCellValue("Grand Total:");
        totalRow.createCell(5).setCellValue(grandTotal);

        Row footer = sheet.createRow(rowNum + 1);
        footer.createCell(0).setCellValue("Generated by " + username + " at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    private void addFooter(Document document, String username) throws Exception {
        document.add(new Paragraph(" "));
        Font footerFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
        Paragraph footer = new Paragraph("Generated by " + username + " at " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), footerFont);
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);
    }
}
