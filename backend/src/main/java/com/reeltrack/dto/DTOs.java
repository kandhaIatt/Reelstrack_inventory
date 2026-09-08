package com.reeltrack.dto;

import com.reeltrack.model.POItem;
import com.reeltrack.model.Reel;
import java.util.List;

public class DTOs {

    public static class LoginRequest {
        private String username;
        private String password;

        public LoginRequest() {}
        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private String username;
        private String name;
        private String role;
        private String unitId;

        public LoginResponse() {}
        public LoginResponse(String token, String username, String name, String role, String unitId) {
            this.token = token;
            this.username = username;
            this.name = name;
            this.role = role;
            this.unitId = unitId;
        }

        public String getToken() { return token; }
        public String getUsername() { return username; }
        public String getName() { return name; }
        public String getRole() { return role; }
        public String getUnitId() { return unitId; }

        public static LoginResponseBuilder builder() { return new LoginResponseBuilder(); }
        public static class LoginResponseBuilder {
            private String token, username, name, role, unitId;
            public LoginResponseBuilder token(String token) { this.token = token; return this; }
            public LoginResponseBuilder username(String username) { this.username = username; return this; }
            public LoginResponseBuilder name(String name) { this.name = name; return this; }
            public LoginResponseBuilder role(String role) { this.role = role; return this; }
            public LoginResponseBuilder unitId(String unitId) { this.unitId = unitId; return this; }
            public LoginResponse build() { return new LoginResponse(token, username, name, role, unitId); }
        }
    }

    public static class JobCalcRequest {
        private String reelId;
        private Integer w;
        private Integer l;
        private Integer gsm;
        private Integer sheets;
        private Boolean corr;
        private Double f;

        public JobCalcRequest() {}
        public JobCalcRequest(String reelId, Integer w, Integer l, Integer gsm, Integer sheets, Boolean corr, Double f) {
            this.reelId = reelId;
            this.w = w;
            this.l = l;
            this.gsm = gsm;
            this.sheets = sheets;
            this.corr = corr;
            this.f = f;
        }

        public String getReelId() { return reelId; }
        public void setReelId(String reelId) { this.reelId = reelId; }
        public Integer getW() { return w; }
        public void setW(Integer w) { this.w = w; }
        public Integer getL() { return l; }
        public void setL(Integer l) { this.l = l; }
        public Integer getGsm() { return gsm; }
        public void setGsm(Integer gsm) { this.gsm = gsm; }
        public Integer getSheets() { return sheets; }
        public void setSheets(Integer sheets) { this.sheets = sheets; }
        public Boolean getCorr() { return corr; }
        public void setCorr(Boolean corr) { this.corr = corr; }
        public Double getF() { return f; }
        public void setF(Double f) { this.f = f; }

        public static JobCalcRequestBuilder builder() { return new JobCalcRequestBuilder(); }
        public static class JobCalcRequestBuilder {
            private String reelId; private Integer w, l, gsm, sheets; private Boolean corr; private Double f;
            public JobCalcRequestBuilder reelId(String reelId) { this.reelId = reelId; return this; }
            public JobCalcRequestBuilder w(Integer w) { this.w = w; return this; }
            public JobCalcRequestBuilder l(Integer l) { this.l = l; return this; }
            public JobCalcRequestBuilder gsm(Integer gsm) { this.gsm = gsm; return this; }
            public JobCalcRequestBuilder sheets(Integer sheets) { this.sheets = sheets; return this; }
            public JobCalcRequestBuilder corr(Boolean corr) { this.corr = corr; return this; }
            public JobCalcRequestBuilder f(Double f) { this.f = f; return this; }
            public JobCalcRequest build() { return new JobCalcRequest(reelId, w, l, gsm, sheets, corr, f); }
        }
    }

    public static class JobCalcResponse {
        private Double effGsm;
        private Double kg;
        private Double prevBalance;
        private Double afterBalance;
        private Double shortKg;
        private Boolean isWidthOk;
        private Boolean isOk;

        public JobCalcResponse() {}
        public JobCalcResponse(Double effGsm, Double kg, Double prevBalance, Double afterBalance, Double shortKg, Boolean isWidthOk, Boolean isOk) {
            this.effGsm = effGsm;
            this.kg = kg;
            this.prevBalance = prevBalance;
            this.afterBalance = afterBalance;
            this.shortKg = shortKg;
            this.isWidthOk = isWidthOk;
            this.isOk = isOk;
        }

        public Double getEffGsm() { return effGsm; }
        public Double getKg() { return kg; }
        public Double getPrevBalance() { return prevBalance; }
        public Double getAfterBalance() { return afterBalance; }
        public Double getShortKg() { return shortKg; }
        public Boolean getIsWidthOk() { return isWidthOk; }
        public Boolean getIsOk() { return isOk; }

        public static JobCalcResponseBuilder builder() { return new JobCalcResponseBuilder(); }
        public static class JobCalcResponseBuilder {
            private Double effGsm, kg, prevBalance, afterBalance, shortKg; private Boolean isWidthOk, isOk;
            public JobCalcResponseBuilder effGsm(Double effGsm) { this.effGsm = effGsm; return this; }
            public JobCalcResponseBuilder kg(Double kg) { this.kg = kg; return this; }
            public JobCalcResponseBuilder prevBalance(Double prevBalance) { this.prevBalance = prevBalance; return this; }
            public JobCalcResponseBuilder afterBalance(Double afterBalance) { this.afterBalance = afterBalance; return this; }
            public JobCalcResponseBuilder shortKg(Double shortKg) { this.shortKg = shortKg; return this; }
            public JobCalcResponseBuilder isWidthOk(Boolean isWidthOk) { this.isWidthOk = isWidthOk; return this; }
            public JobCalcResponseBuilder isOk(Boolean isOk) { this.isOk = isOk; return this; }
            public JobCalcResponse build() { return new JobCalcResponse(effGsm, kg, prevBalance, afterBalance, shortKg, isWidthOk, isOk); }
        }
    }

    public static class RecommendationCandidate {
        private Reel reel;
        private Double rem;
        private Double req;
        private Boolean fitsWidth;
        private Boolean enough;
        private Integer trim;
        private Boolean gsmMatch;
        private Double leftover;
        private Double score;

        public RecommendationCandidate() {}
        public RecommendationCandidate(Reel reel, Double rem, Double req, Boolean fitsWidth, Boolean enough, Integer trim, Boolean gsmMatch, Double leftover, Double score) {
            this.reel = reel;
            this.rem = rem;
            this.req = req;
            this.fitsWidth = fitsWidth;
            this.enough = enough;
            this.trim = trim;
            this.gsmMatch = gsmMatch;
            this.leftover = leftover;
            this.score = score;
        }

        public Reel getReel() { return reel; }
        public Double getRem() { return rem; }
        public Double getReq() { return req; }
        public Boolean getFitsWidth() { return fitsWidth; }
        public Boolean getEnough() { return enough; }
        public Integer getTrim() { return trim; }
        public Boolean getGsmMatch() { return gsmMatch; }
        public Double getLeftover() { return leftover; }
        public Double getScore() { return score; }

        public static RecommendationCandidateBuilder builder() { return new RecommendationCandidateBuilder(); }
        public static class RecommendationCandidateBuilder {
            private Reel reel; private Double rem, req, leftover, score; private Boolean fitsWidth, enough, gsmMatch; private Integer trim;
            public RecommendationCandidateBuilder reel(Reel reel) { this.reel = reel; return this; }
            public RecommendationCandidateBuilder rem(Double rem) { this.rem = rem; return this; }
            public RecommendationCandidateBuilder req(Double req) { this.req = req; return this; }
            public RecommendationCandidateBuilder fitsWidth(Boolean fitsWidth) { this.fitsWidth = fitsWidth; return this; }
            public RecommendationCandidateBuilder enough(Boolean enough) { this.enough = enough; return this; }
            public RecommendationCandidateBuilder trim(Integer trim) { this.trim = trim; return this; }
            public RecommendationCandidateBuilder gsmMatch(Boolean gsmMatch) { this.gsmMatch = gsmMatch; return this; }
            public RecommendationCandidateBuilder leftover(Double leftover) { this.leftover = leftover; return this; }
            public RecommendationCandidateBuilder score(Double score) { this.score = score; return this; }
            public RecommendationCandidate build() { return new RecommendationCandidate(reel, rem, req, fitsWidth, enough, trim, gsmMatch, leftover, score); }
        }
    }

    public static class SplitLeg {
        private Reel reel;
        private Integer sheets;
        private Double kg;
        private Double rem;
        private Double after;
        private Integer trim;
        private Boolean gsmMatch;

        public SplitLeg() {}
        public SplitLeg(Reel reel, Integer sheets, Double kg, Double rem, Double after, Integer trim, Boolean gsmMatch) {
            this.reel = reel;
            this.sheets = sheets;
            this.kg = kg;
            this.rem = rem;
            this.after = after;
            this.trim = trim;
            this.gsmMatch = gsmMatch;
        }

        public Reel getReel() { return reel; }
        public Integer getSheets() { return sheets; }
        public Double getKg() { return kg; }
        public Double getRem() { return rem; }
        public Double getAfter() { return after; }
        public Integer getTrim() { return trim; }
        public Boolean getGsmMatch() { return gsmMatch; }

        public static SplitLegBuilder builder() { return new SplitLegBuilder(); }
        public static class SplitLegBuilder {
            private Reel reel; private Integer sheets, trim; private Double kg, rem, after; private Boolean gsmMatch;
            public SplitLegBuilder reel(Reel reel) { this.reel = reel; return this; }
            public SplitLegBuilder sheets(Integer sheets) { this.sheets = sheets; return this; }
            public SplitLegBuilder kg(Double kg) { this.kg = kg; return this; }
            public SplitLegBuilder rem(Double rem) { this.rem = rem; return this; }
            public SplitLegBuilder after(Double after) { this.after = after; return this; }
            public SplitLegBuilder trim(Integer trim) { this.trim = trim; return this; }
            public SplitLegBuilder gsmMatch(Boolean gsmMatch) { this.gsmMatch = gsmMatch; return this; }
            public SplitLeg build() { return new SplitLeg(reel, sheets, kg, rem, after, trim, gsmMatch); }
        }
    }

    public static class SplitPlanResponse {
        private List<SplitLeg> legs;
        private Integer shortSheets;
        private Boolean feasible;
        private Double perSheetKg;

        public SplitPlanResponse() {}
        public SplitPlanResponse(List<SplitLeg> legs, Integer shortSheets, Boolean feasible, Double perSheetKg) {
            this.legs = legs;
            this.shortSheets = shortSheets;
            this.feasible = feasible;
            this.perSheetKg = perSheetKg;
        }

        public List<SplitLeg> getLegs() { return legs; }
        public Integer getShortSheets() { return shortSheets; }
        public Boolean getFeasible() { return feasible; }
        public Double getPerSheetKg() { return perSheetKg; }

        public static SplitPlanResponseBuilder builder() { return new SplitPlanResponseBuilder(); }
        public static class SplitPlanResponseBuilder {
            private List<SplitLeg> legs; private Integer shortSheets; private Boolean feasible; private Double perSheetKg;
            public SplitPlanResponseBuilder legs(List<SplitLeg> legs) { this.legs = legs; return this; }
            public SplitPlanResponseBuilder shortSheets(Integer shortSheets) { this.shortSheets = shortSheets; return this; }
            public SplitPlanResponseBuilder feasible(Boolean feasible) { this.feasible = feasible; return this; }
            public SplitPlanResponseBuilder perSheetKg(Double perSheetKg) { this.perSheetKg = perSheetKg; return this; }
            public SplitPlanResponse build() { return new SplitPlanResponse(legs, shortSheets, feasible, perSheetKg); }
        }
    }

    public static class POCreateRequest {
        private String supplier;
        private String unit;
        private String eta;
        private String terms;
        private List<POItem> items;

        public POCreateRequest() {}
        public POCreateRequest(String supplier, String unit, String eta, String terms, List<POItem> items) {
            this.supplier = supplier;
            this.unit = unit;
            this.eta = eta;
            this.terms = terms;
            this.items = items;
        }

        public String getSupplier() { return supplier; }
        public void setSupplier(String supplier) { this.supplier = supplier; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getEta() { return eta; }
        public void setEta(String eta) { this.eta = eta; }
        public String getTerms() { return terms; }
        public void setTerms(String terms) { this.terms = terms; }
        public List<POItem> getItems() { return items; }
        public void setItems(List<POItem> items) { this.items = items; }
    }

    public static class ReceiveReelRequest {
        private String reelNo;
        private Double kg;
        private Integer gsm;
        private Integer width;
        private Integer bf;
        private String type;
        private String mill;
        private String unit;

        public ReceiveReelRequest() {}
        public ReceiveReelRequest(String reelNo, Double kg, Integer gsm, Integer width, Integer bf, String type, String mill, String unit) {
            this.reelNo = reelNo;
            this.kg = kg;
            this.gsm = gsm;
            this.width = width;
            this.bf = bf;
            this.type = type;
            this.mill = mill;
            this.unit = unit;
        }

        public String getReelNo() { return reelNo; }
        public void setReelNo(String reelNo) { this.reelNo = reelNo; }
        public Double getKg() { return kg; }
        public void setKg(Double kg) { this.kg = kg; }
        public Integer getGsm() { return gsm; }
        public void setGsm(Integer gsm) { this.gsm = gsm; }
        public Integer getWidth() { return width; }
        public void setWidth(Integer width) { this.width = width; }
        public Integer getBf() { return bf; }
        public void setBf(Integer bf) { this.bf = bf; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMill() { return mill; }
        public void setMill(String mill) { this.mill = mill; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
    }

    public static class TransferRequest {
        private String reelId;
        private String toUnit;
        private String ref;
        private String notes;

        public TransferRequest() {}
        public TransferRequest(String reelId, String toUnit, String ref, String notes) {
            this.reelId = reelId;
            this.toUnit = toUnit;
            this.ref = ref;
            this.notes = notes;
        }

        public String getReelId() { return reelId; }
        public void setReelId(String reelId) { this.reelId = reelId; }
        public String getToUnit() { return toUnit; }
        public void setToUnit(String toUnit) { this.toUnit = toUnit; }
        public String getRef() { return ref; }
        public void setRef(String ref) { this.ref = ref; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
