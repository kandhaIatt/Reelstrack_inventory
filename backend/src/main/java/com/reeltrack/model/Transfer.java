package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ref;
    private String reel;
    private String fromUnit;
    private String toUnit;
    private Double kg;
    private String date;
    private String byUser;

    @Column(length = 500)
    private String notes;

    public Transfer() {}

    public Transfer(Long id, String ref, String reel, String fromUnit, String toUnit, Double kg, String date, String byUser, String notes) {
        this.id = id;
        this.ref = ref;
        this.reel = reel;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.kg = kg;
        this.date = date;
        this.byUser = byUser;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRef() { return ref; }
    public void setRef(String ref) { this.ref = ref; }

    public String getReel() { return reel; }
    public void setReel(String reel) { this.reel = reel; }

    public String getFromUnit() { return fromUnit; }
    public void setFromUnit(String fromUnit) { this.fromUnit = fromUnit; }

    public String getToUnit() { return toUnit; }
    public void setToUnit(String toUnit) { this.toUnit = toUnit; }

    public Double getKg() { return kg; }
    public void setKg(Double kg) { this.kg = kg; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getByUser() { return byUser; }
    public void setByUser(String byUser) { this.byUser = byUser; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public static TransferBuilder builder() { return new TransferBuilder(); }

    public static class TransferBuilder {
        private Long id;
        private String ref;
        private String reel;
        private String fromUnit;
        private String toUnit;
        private Double kg;
        private String date;
        private String byUser;
        private String notes;

        public TransferBuilder id(Long id) { this.id = id; return this; }
        public TransferBuilder ref(String ref) { this.ref = ref; return this; }
        public TransferBuilder reel(String reel) { this.reel = reel; return this; }
        public TransferBuilder fromUnit(String fromUnit) { this.fromUnit = fromUnit; return this; }
        public TransferBuilder toUnit(String toUnit) { this.toUnit = toUnit; return this; }
        public TransferBuilder kg(Double kg) { this.kg = kg; return this; }
        public TransferBuilder date(String date) { this.date = date; return this; }
        public TransferBuilder byUser(String byUser) { this.byUser = byUser; return this; }
        public TransferBuilder notes(String notes) { this.notes = notes; return this; }

        public Transfer build() {
            return new Transfer(id, ref, reel, fromUnit, toUnit, kg, date, byUser, notes);
        }
    }
}
