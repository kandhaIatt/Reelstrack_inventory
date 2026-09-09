package com.reeltrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    private String id;
    private String name;
    private String code;
    private String city;
    private String stateCode;
    private String incharge;
    private Integer targetReels;
    private Double targetWeight;
    private Integer targetJobs;
    private Boolean active = true;

    public Unit() {}

    public Unit(String id, String name, String code, String city, String stateCode, String incharge, Integer targetReels, Double targetWeight, Integer targetJobs, Boolean active) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.city = city;
        this.stateCode = stateCode;
        this.incharge = incharge;
        this.targetReels = targetReels;
        this.targetWeight = targetWeight;
        this.targetJobs = targetJobs;
        this.active = active != null ? active : true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }

    public String getIncharge() { return incharge; }
    public void setIncharge(String incharge) { this.incharge = incharge; }

    public Integer getTargetReels() { return targetReels; }
    public void setTargetReels(Integer targetReels) { this.targetReels = targetReels; }

    public Double getTargetWeight() { return targetWeight; }
    public void setTargetWeight(Double targetWeight) { this.targetWeight = targetWeight; }

    public Integer getTargetJobs() { return targetJobs; }
    public void setTargetJobs(Integer targetJobs) { this.targetJobs = targetJobs; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public static UnitBuilder builder() { return new UnitBuilder(); }

    public static class UnitBuilder {
        private String id;
        private String name;
        private String code;
        private String city;
        private String stateCode;
        private String incharge;
        private Integer targetReels;
        private Double targetWeight;
        private Integer targetJobs;
        private Boolean active = true;

        public UnitBuilder id(String id) { this.id = id; return this; }
        public UnitBuilder name(String name) { this.name = name; return this; }
        public UnitBuilder code(String code) { this.code = code; return this; }
        public UnitBuilder city(String city) { this.city = city; return this; }
        public UnitBuilder stateCode(String stateCode) { this.stateCode = stateCode; return this; }
        public UnitBuilder incharge(String incharge) { this.incharge = incharge; return this; }
        public UnitBuilder targetReels(Integer targetReels) { this.targetReels = targetReels; return this; }
        public UnitBuilder targetWeight(Double targetWeight) { this.targetWeight = targetWeight; return this; }
        public UnitBuilder targetJobs(Integer targetJobs) { this.targetJobs = targetJobs; return this; }
        public UnitBuilder active(Boolean active) { this.active = active; return this; }

        public Unit build() {
            return new Unit(id, name, code, city, stateCode, incharge, targetReels, targetWeight, targetJobs, active);
        }
    }
}
