package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reels")
public class Reel {

    @Id
    private String id;
    private String type;
    private Integer gsm;
    private Integer bf;
    private Integer width;
    private Double orig;
    private Double remaining;
    private String mill;
    private String unit;
    private String rec;
    private String po;
    // Fields for inventory management / non-PO source
    private String source;
    private String supplier;
    private Double rate;
    private String note;
    private String addedBy;
    private String name;
    private java.math.BigDecimal weight;
    private Boolean active;
    private String status = "AVAILABLE";

    public Reel() {}

    public Reel(String id, String type, Integer gsm, Integer bf, Integer width, Double orig, Double remaining, String mill, String unit, String rec, String po) {
        this.id = id;
        this.type = type;
        this.gsm = gsm;
        this.bf = bf;
        this.width = width;
        this.orig = orig;
        this.remaining = remaining;
        this.mill = mill;
        this.unit = unit;
        this.rec = rec;
        this.po = po;
    }

    public Reel(String id, String type, Integer gsm, Integer bf, Integer width, Double orig, Double remaining, String mill, String unit, String rec, String po, String source, String supplier, Double rate, String note, String addedBy) {
        this.id = id;
        this.type = type;
        this.gsm = gsm;
        this.bf = bf;
        this.width = width;
        this.orig = orig;
        this.remaining = remaining;
        this.mill = mill;
        this.unit = unit;
        this.rec = rec;
        this.po = po;
        this.source = source;
        this.supplier = supplier;
        this.rate = rate;
        this.note = note;
        this.addedBy = addedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getGsm() { return gsm; }
    public void setGsm(Integer gsm) { this.gsm = gsm; }

    public Integer getBf() { return bf; }
    public void setBf(Integer bf) { this.bf = bf; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Double getOrig() { return orig; }
    public void setOrig(Double orig) { this.orig = orig; }

    public Double getRemaining() { return remaining; }
    public void setRemaining(Double remaining) { this.remaining = remaining; }

    public String getMill() { return mill; }
    public void setMill(String mill) { this.mill = mill; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getRec() { return rec; }
    public void setRec(String rec) { this.rec = rec; }

    public String getPo() { return po; }
    public void setPo(String po) { this.po = po; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getAddedBy() { return addedBy; }
    public void setAddedBy(String addedBy) { this.addedBy = addedBy; }

        // Getters and Setters for new fields
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public java.math.BigDecimal getWeight() { return weight; }
    public void setWeight(java.math.BigDecimal weight) { this.weight = weight; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static ReelBuilder builder() { return new ReelBuilder(); }

    public static class ReelBuilder {
        private String id;
        private String type;
        private Integer gsm;
        private Integer bf;
        private Integer width;
        private Double orig;
        private Double remaining;
        private String mill;
        private String unit;
        private String rec;
        private String po;
        private String source;
        private String supplier;
        private Double rate;
        private String note;
        private String addedBy;

        public ReelBuilder id(String id) { this.id = id; return this; }
        public ReelBuilder type(String type) { this.type = type; return this; }
        public ReelBuilder gsm(Integer gsm) { this.gsm = gsm; return this; }
        public ReelBuilder bf(Integer bf) { this.bf = bf; return this; }
        public ReelBuilder width(Integer width) { this.width = width; return this; }
        public ReelBuilder orig(Double orig) { this.orig = orig; return this; }
        public ReelBuilder remaining(Double remaining) { this.remaining = remaining; return this; }
        public ReelBuilder mill(String mill) { this.mill = mill; return this; }
        public ReelBuilder unit(String unit) { this.unit = unit; return this; }
        public ReelBuilder rec(String rec) { this.rec = rec; return this; }
        public ReelBuilder po(String po) { this.po = po; return this; }
        public ReelBuilder source(String source) { this.source = source; return this; }
        public ReelBuilder supplier(String supplier) { this.supplier = supplier; return this; }
        public ReelBuilder rate(Double rate) { this.rate = rate; return this; }
        public ReelBuilder note(String note) { this.note = note; return this; }
        public ReelBuilder addedBy(String addedBy) { this.addedBy = addedBy; return this; }

        public Reel build() {
            return new Reel(id, type, gsm, bf, width, orig, remaining, mill, unit, rec, po, source, supplier, rate, note, addedBy);
        }
    }
}
