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

    public POItem() {}

    public POItem(Long id, String type, Integer gsm, Integer width, Integer bf, Integer qty, Double kg, Double rate) {
        this.id = id;
        this.type = type;
        this.gsm = gsm;
        this.width = width;
        this.bf = bf;
        this.qty = qty;
        this.kg = kg;
        this.rate = rate;
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

        public POItemBuilder id(Long id) { this.id = id; return this; }
        public POItemBuilder type(String type) { this.type = type; return this; }
        public POItemBuilder gsm(Integer gsm) { this.gsm = gsm; return this; }
        public POItemBuilder width(Integer width) { this.width = width; return this; }
        public POItemBuilder bf(Integer bf) { this.bf = bf; return this; }
        public POItemBuilder qty(Integer qty) { this.qty = qty; return this; }
        public POItemBuilder kg(Double kg) { this.kg = kg; return this; }
        public POItemBuilder rate(Double rate) { this.rate = rate; return this; }

        public POItem build() {
            return new POItem(id, type, gsm, width, bf, qty, kg, rate);
        }
    }
}
