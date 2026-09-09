package com.reeltrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_configs")
public class BusinessConfig {

    @Id
    private String id = "DEFAULT";
    private String reelNumberFormat = "R-{SEQ}";
    private Double corrugationFactor = 0.45;
    private String poNumberFormat = "PO-2026-{SEQ:4}";
    private Double defaultGstRate = 18.0;

    public BusinessConfig() {}

    public BusinessConfig(String id, String reelNumberFormat, Double corrugationFactor, String poNumberFormat, Double defaultGstRate) {
        this.id = id != null ? id : "DEFAULT";
        this.reelNumberFormat = reelNumberFormat != null ? reelNumberFormat : "R-{SEQ}";
        this.corrugationFactor = corrugationFactor != null ? corrugationFactor : 0.45;
        this.poNumberFormat = poNumberFormat != null ? poNumberFormat : "PO-2026-{SEQ:4}";
        this.defaultGstRate = defaultGstRate != null ? defaultGstRate : 18.0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReelNumberFormat() { return reelNumberFormat; }
    public void setReelNumberFormat(String reelNumberFormat) { this.reelNumberFormat = reelNumberFormat; }

    public Double getCorrugationFactor() { return corrugationFactor; }
    public void setCorrugationFactor(Double corrugationFactor) { this.corrugationFactor = corrugationFactor; }

    public String getPoNumberFormat() { return poNumberFormat; }
    public void setPoNumberFormat(String poNumberFormat) { this.poNumberFormat = poNumberFormat; }

    public Double getDefaultGstRate() { return defaultGstRate; }
    public void setDefaultGstRate(Double defaultGstRate) { this.defaultGstRate = defaultGstRate; }

    public static BusinessConfigBuilder builder() { return new BusinessConfigBuilder(); }

    public static class BusinessConfigBuilder {
        private String id = "DEFAULT";
        private String reelNumberFormat = "R-{SEQ}";
        private Double corrugationFactor = 0.45;
        private String poNumberFormat = "PO-2026-{SEQ:4}";
        private Double defaultGstRate = 18.0;

        public BusinessConfigBuilder id(String id) { this.id = id; return this; }
        public BusinessConfigBuilder reelNumberFormat(String reelNumberFormat) { this.reelNumberFormat = reelNumberFormat; return this; }
        public BusinessConfigBuilder corrugationFactor(Double corrugationFactor) { this.corrugationFactor = corrugationFactor; return this; }
        public BusinessConfigBuilder poNumberFormat(String poNumberFormat) { this.poNumberFormat = poNumberFormat; return this; }
        public BusinessConfigBuilder defaultGstRate(Double defaultGstRate) { this.defaultGstRate = defaultGstRate; return this; }

        public BusinessConfig build() {
            return new BusinessConfig(id, reelNumberFormat, corrugationFactor, poNumberFormat, defaultGstRate);
        }
    }
}
