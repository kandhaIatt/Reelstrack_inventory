package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    private String id;
    private String name;
    private String mill;
    private String gst;
    private String contact;
    private String phone;
    private String terms;

    public Supplier() {}

    public Supplier(String id, String name, String mill, String gst, String contact, String phone, String terms) {
        this.id = id;
        this.name = name;
        this.mill = mill;
        this.gst = gst;
        this.contact = contact;
        this.phone = phone;
        this.terms = terms;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMill() { return mill; }
    public void setMill(String mill) { this.mill = mill; }

    public String getGst() { return gst; }
    public void setGst(String gst) { this.gst = gst; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }

    public static SupplierBuilder builder() { return new SupplierBuilder(); }

    public static class SupplierBuilder {
        private String id;
        private String name;
        private String mill;
        private String gst;
        private String contact;
        private String phone;
        private String terms;

        public SupplierBuilder id(String id) { this.id = id; return this; }
        public SupplierBuilder name(String name) { this.name = name; return this; }
        public SupplierBuilder mill(String mill) { this.mill = mill; return this; }
        public SupplierBuilder gst(String gst) { this.gst = gst; return this; }
        public SupplierBuilder contact(String contact) { this.contact = contact; return this; }
        public SupplierBuilder phone(String phone) { this.phone = phone; return this; }
        public SupplierBuilder terms(String terms) { this.terms = terms; return this; }

        public Supplier build() {
            return new Supplier(id, name, mill, gst, contact, phone, terms);
        }
    }
}
