package com.reeltrack.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    private String id;

    private String supplier;
    private String unit;
    private String date;
    private String eta;
    private String terms;
    private String status;
    private Integer received;
    private String raisedBy;

    @Column(length = 1000)
    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "po_id")
    private List<POItem> items = new ArrayList<>();

    public PurchaseOrder() {}

    public PurchaseOrder(String id, String supplier, String unit, String date, String eta, String terms, String status, Integer received, String raisedBy, String notes, List<POItem> items) {
        this.id = id;
        this.supplier = supplier;
        this.unit = unit;
        this.date = date;
        this.eta = eta;
        this.terms = terms;
        this.status = status;
        this.received = received;
        this.raisedBy = raisedBy;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getEta() { return eta; }
    public void setEta(String eta) { this.eta = eta; }

    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getReceived() { return received; }
    public void setReceived(Integer received) { this.received = received; }

    public String getRaisedBy() { return raisedBy; }
    public void setRaisedBy(String raisedBy) { this.raisedBy = raisedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<POItem> getItems() { return items; }
    public void setItems(List<POItem> items) { this.items = items; }

    public static PurchaseOrderBuilder builder() { return new PurchaseOrderBuilder(); }

    public static class PurchaseOrderBuilder {
        private String id;
        private String supplier;
        private String unit;
        private String date;
        private String eta;
        private String terms;
        private String status;
        private Integer received;
        private String raisedBy;
        private String notes;
        private List<POItem> items = new ArrayList<>();

        public PurchaseOrderBuilder id(String id) { this.id = id; return this; }
        public PurchaseOrderBuilder supplier(String supplier) { this.supplier = supplier; return this; }
        public PurchaseOrderBuilder unit(String unit) { this.unit = unit; return this; }
        public PurchaseOrderBuilder date(String date) { this.date = date; return this; }
        public PurchaseOrderBuilder eta(String eta) { this.eta = eta; return this; }
        public PurchaseOrderBuilder terms(String terms) { this.terms = terms; return this; }
        public PurchaseOrderBuilder status(String status) { this.status = status; return this; }
        public PurchaseOrderBuilder received(Integer received) { this.received = received; return this; }
        public PurchaseOrderBuilder raisedBy(String raisedBy) { this.raisedBy = raisedBy; return this; }
        public PurchaseOrderBuilder notes(String notes) { this.notes = notes; return this; }
        public PurchaseOrderBuilder items(List<POItem> items) { this.items = items; return this; }

        public PurchaseOrder build() {
            return new PurchaseOrder(id, supplier, unit, date, eta, terms, status, received, raisedBy, notes, items);
        }
    }
}
