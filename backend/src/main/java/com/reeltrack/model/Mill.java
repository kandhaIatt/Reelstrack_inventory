package com.reeltrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mills")
public class Mill {

    @Id
    private String id;
    private String name;
    private String place;
    private String grades;
    private Boolean active = true;

    public Mill() {}

    public Mill(String id, String name, String place, String grades, Boolean active) {
        this.id = id;
        this.name = name;
        this.place = place;
        this.grades = grades;
        this.active = active != null ? active : true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlace() { return place; }
    public void setPlace(String place) { this.place = place; }

    public String getGrades() { return grades; }
    public void setGrades(String grades) { this.grades = grades; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public static MillBuilder builder() { return new MillBuilder(); }

    public static class MillBuilder {
        private String id;
        private String name;
        private String place;
        private String grades;
        private Boolean active = true;

        public MillBuilder id(String id) { this.id = id; return this; }
        public MillBuilder name(String name) { this.name = name; return this; }
        public MillBuilder place(String place) { this.place = place; return this; }
        public MillBuilder grades(String grades) { this.grades = grades; return this; }
        public MillBuilder active(Boolean active) { this.active = active; return this; }

        public Mill build() {
            return new Mill(id, name, place, grades, active);
        }
    }
}
