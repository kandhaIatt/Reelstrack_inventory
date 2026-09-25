package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "po_items")
public class POItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private Integer gsm;
    private Integer width;
    private Integer bf;
    private Integer qty;
    private Double kg;
    private Double rate;
    private Double gstRate;
    private Double cgst;
    private Double sgst;
    private Double igst;
    private Double totalTax;
    private Double totalWithGst;

    public POItem() {}

    public POItem(Long id, String type, Integer gsm, Integer width, Integer bf, Integer qty, Double kg, Double rate, Double gstRate, Double cgst, Double sgst, Double igst, Double totalTax, Double totalWithGst) {
        this.id = id;
        this.type = type;
        this.gsm = gsm;
        this.width = width;
        this.bf = bf;
        this.qty = qty;
        this.kg = kg;
        this.rate = rate;
        this.gstRate = gstRate;
        this.cgst = cgst;
        this.sgst = sgst;
        this.igst = igst;
        this.totalTax = totalTax;
        this.totalWithGst = totalWithGst;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getGsm() { return gsm; }
    public void setGsm(Integer gsm) { this.gsm = gsm; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getBf() { return bf; }
    public void setBf(Integer bf) { this.bf = bf; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public Double getKg() { return kg; }
    public void setKg(Double kg) { this.kg = kg; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public Double getGstRate() { return gstRate; }
    public void setGstRate(Double gstRate) { this.gstRate = gstRate; }

    public Double getCgst() { return cgst; }
    public void setCgst(Double cgst) { this.cgst = cgst; }

    public Double getSgst() { return sgst; }
    public void setSgst(Double sgst) { this.sgst = sgst; }

    public Double getIgst() { return igst; }
    public void setIgst(Double igst) { this.igst = igst; }

    public Double getTotalTax() { return totalTax; }
    public void setTotalTax(Double totalTax) { this.totalTax = totalTax; }

    public Double getTotalWithGst() { return totalWithGst; }
    public void setTotalWithGst(Double totalWithGst) { this.totalWithGst = totalWithGst; }

    public static POItemBuilder builder() { return new POItemBuilder(); }

    public static class POItemBuilder {
        private Long id;
        private String type;
        private Integer gsm;
        private Integer width;
        private Integer bf;
        private Integer qty;
        private Double kg;
        private Double rate;
        private Double gstRate;
        private Double cgst;
        private Double sgst;
        private Double igst;
        private Double totalTax;
        private Double totalWithGst;

        public POItemBuilder id(Long id) { this.id = id; return this; }
        public POItemBuilder type(String type) { this.type = type; return this; }
        public POItemBuilder gsm(Integer gsm) { this.gsm = gsm; return this; }
        public POItemBuilder width(Integer width) { this.width = width; return this; }
        public POItemBuilder bf(Integer bf) { this.bf = bf; return this; }
        public POItemBuilder qty(Integer qty) { this.qty = qty; return this; }
        public POItemBuilder kg(Double kg) { this.kg = kg; return this; }
        public POItemBuilder rate(Double rate) { this.rate = rate; return this; }
        public POItemBuilder gstRate(Double gstRate) { this.gstRate = gstRate; return this; }
        public POItemBuilder cgst(Double cgst) { this.cgst = cgst; return this; }
        public POItemBuilder sgst(Double sgst) { this.sgst = sgst; return this; }
        public POItemBuilder igst(Double igst) { this.igst = igst; return this; }
        public POItemBuilder totalTax(Double totalTax) { this.totalTax = totalTax; return this; }
        public POItemBuilder totalWithGst(Double totalWithGst) { this.totalWithGst = totalWithGst; return this; }

        public POItem build() {
            return new POItem(id, type, gsm, width, bf, qty, kg, rate, gstRate, cgst, sgst, igst, totalTax, totalWithGst);
        }
    }
}
