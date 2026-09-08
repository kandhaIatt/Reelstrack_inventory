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

        public Reel build() {
            return new Reel(id, type, gsm, bf, width, orig, remaining, mill, unit, rec, po);
        }
    }
}
