package com.reeltrack.dto;

import java.time.LocalDate;
import java.util.List;

public class AddReelsRequest {

    private String type;
    private Integer gsm;
    private Integer bf;
    private Integer width;
    private String mill;
    private String unit;
    private String source;
    private String poNumber;
    private String supplier;
    private String billNumber;
    private String vehicleNo;
    private Double totalValue;
    private Double rate;
    private String note;
    private LocalDate date;
    private List<ReelItem> reels;

    public AddReelsRequest() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getGsm() { return gsm; }
    public void setGsm(Integer gsm) { this.gsm = gsm; }

    public Integer getBf() { return bf; }
    public void setBf(Integer bf) { this.bf = bf; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public String getMill() { return mill; }
    public void setMill(String mill) { this.mill = mill; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public String getVehicleNo() { return vehicleNo; }
    public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }

    public Double getTotalValue() { return totalValue; }
    public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<ReelItem> getReels() { return reels; }
    public void setReels(List<ReelItem> reels) { this.reels = reels; }

    public static class ReelItem {
        private String id;
        private Double weight;

        public ReelItem() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
    }
}
