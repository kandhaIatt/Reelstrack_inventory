package com.reeltrack.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stock_counts")
public class StockCount {

    @Id
    private String id;

    private String date;
    private String unit;
    private String status; // PENDING, POSTED
    private String initiatedBy;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "stock_count_id")
    private List<StockCountLine> lines = new ArrayList<>();

    public StockCount() {}

    public StockCount(String id, String date, String unit, String status, String initiatedBy, List<StockCountLine> lines) {
        this.id = id;
        this.date = date;
        this.unit = unit;
        this.status = status;
        this.initiatedBy = initiatedBy;
        this.lines = lines != null ? lines : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(String initiatedBy) { this.initiatedBy = initiatedBy; }

    public List<StockCountLine> getLines() { return lines; }
    public void setLines(List<StockCountLine> lines) { this.lines = lines; }
}
