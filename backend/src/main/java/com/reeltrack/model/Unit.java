package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    private String id;
    private String name;
    private String code;
    private String city;
    private String incharge;
    private Integer targetReels;
    private Double targetWeight;
    private Integer targetJobs;

    public Unit() {}

    public Unit(String id, String name, String code, String city, String incharge, Integer targetReels, Double targetWeight, Integer targetJobs) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.city = city;
        this.incharge = incharge;
        this.targetReels = targetReels;
        this.targetWeight = targetWeight;
        this.targetJobs = targetJobs;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getIncharge() { return incharge; }
    public void setIncharge(String incharge) { this.incharge = incharge; }

    public Integer getTargetReels() { return targetReels; }
    public void setTargetReels(Integer targetReels) { this.targetReels = targetReels; }

    public Double getTargetWeight() { return targetWeight; }
    public void setTargetWeight(Double targetWeight) { this.targetWeight = targetWeight; }

    public Integer getTargetJobs() { return targetJobs; }
    public void setTargetJobs(Integer targetJobs) { this.targetJobs = targetJobs; }

    public static UnitBuilder builder() { return new UnitBuilder(); }

    public static class UnitBuilder {
        private String id;
        private String name;
        private String code;
        private String city;
        private String incharge;
        private Integer targetReels;
        private Double targetWeight;
        private Integer targetJobs;

        public UnitBuilder id(String id) { this.id = id; return this; }
        public UnitBuilder name(String name) { this.name = name; return this; }
        public UnitBuilder code(String code) { this.code = code; return this; }
        public UnitBuilder city(String city) { this.city = city; return this; }
        public UnitBuilder incharge(String incharge) { this.incharge = incharge; return this; }
        public UnitBuilder targetReels(Integer targetReels) { this.targetReels = targetReels; return this; }
        public UnitBuilder targetWeight(Double targetWeight) { this.targetWeight = targetWeight; return this; }
        public UnitBuilder targetJobs(Integer targetJobs) { this.targetJobs = targetJobs; return this; }

        public Unit build() {
            return new Unit(id, name, code, city, incharge, targetReels, targetWeight, targetJobs);
        }
    }
}
