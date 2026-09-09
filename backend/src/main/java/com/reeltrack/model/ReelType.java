package com.reeltrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reel_types")
public class ReelType {

    @Id
    private String id;
    private String name;
    private Integer defaultGsm;
    private Integer defaultBf;
    private Boolean active = true;

    public ReelType() {}

    public ReelType(String id, String name, Integer defaultGsm, Integer defaultBf, Boolean active) {
        this.id = id;
        this.name = name;
        this.defaultGsm = defaultGsm;
        this.defaultBf = defaultBf;
        this.active = active != null ? active : true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getDefaultGsm() { return defaultGsm; }
    public void setDefaultGsm(Integer defaultGsm) { this.defaultGsm = defaultGsm; }

    public Integer getDefaultBf() { return defaultBf; }
    public void setDefaultBf(Integer defaultBf) { this.defaultBf = defaultBf; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public static ReelTypeBuilder builder() { return new ReelTypeBuilder(); }

    public static class ReelTypeBuilder {
        private String id;
        private String name;
        private Integer defaultGsm;
        private Integer defaultBf;
        private Boolean active = true;

        public ReelTypeBuilder id(String id) { this.id = id; return this; }
        public ReelTypeBuilder name(String name) { this.name = name; return this; }
        public ReelTypeBuilder defaultGsm(Integer defaultGsm) { this.defaultGsm = defaultGsm; return this; }
        public ReelTypeBuilder defaultBf(Integer defaultBf) { this.defaultBf = defaultBf; return this; }
        public ReelTypeBuilder active(Boolean active) { this.active = active; return this; }

        public ReelType build() {
            return new ReelType(id, name, defaultGsm, defaultBf, active);
        }
    }
}
