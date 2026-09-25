package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_count_lines")
public class StockCountLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reelId;
    private Double expectedKg;
    private Double actualKg;
    private Double varianceKg;
    private String status; // MATCHED, SHORT, OVER
    private String reason;

    public StockCountLine() {}

    public StockCountLine(Long id, String reelId, Double expectedKg, Double actualKg, Double varianceKg, String status) {
        this.id = id;
        this.reelId = reelId;
        this.expectedKg = expectedKg;
        this.actualKg = actualKg;
        this.varianceKg = varianceKg;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReelId() { return reelId; }
    public void setReelId(String reelId) { this.reelId = reelId; }

    public Double getExpectedKg() { return expectedKg; }
    public void setExpectedKg(Double expectedKg) { this.expectedKg = expectedKg; }

    public Double getActualKg() { return actualKg; }
    public void setActualKg(Double actualKg) { this.actualKg = actualKg; }

    public Double getVarianceKg() { return varianceKg; }
    public void setVarianceKg(Double varianceKg) { this.varianceKg = varianceKg; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
