package com.reeltrack.dto;

import jakarta.validation.constraints.NotBlank;

public final class MasterDTOs {

    private MasterDTOs() {}

    public static class UnitRequest {
        private String id;

        @NotBlank
        private String name;

        @NotBlank
        private String code;

        private String city;
        private String stateCode;
        private String incharge;
        private Integer targetReels;
        private Double targetWeight;
        private Integer targetJobs;
        private Boolean active = true;

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
    }

    public static class MillRequest {
        private String id;

        @NotBlank
        private String name;

        private String place;
        private String grades;
        private Boolean active = true;

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
    }

    public static class ReelTypeRequest {
        private String id;

        @NotBlank
        private String name;

        private Integer defaultGsm;
        private Integer defaultBf;
        private Boolean active = true;

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
    }

    public static class SettingRequest {
        @NotBlank
        private String key;

        private String value;

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    public static class SupplierRequest {
        private String id;
        @NotBlank
        private String name;
        private String mill;
        private String gst;
        private String contact;
        private String phone;
        private String terms;

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
    }

    public static class UserRequest {
        private Long id;
        @NotBlank
        private String username;
        private String password;
        @NotBlank
        private String name;
        private String role;
        private String unitId;
        private String email;
        private String mobile;
        private Boolean active = true;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getUnitId() { return unitId; }
        public void setUnitId(String unitId) { this.unitId = unitId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    public static class PasswordChangeRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
