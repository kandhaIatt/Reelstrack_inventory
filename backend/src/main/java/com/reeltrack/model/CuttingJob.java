package com.reeltrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cutting_jobs")
public class CuttingJob {

    @Id
    private String no;

    private String reel;
    private String unit;
    private Integer w;
    private Integer l;
    private Integer gsm;
    private Integer sheets;
    private Boolean corr;
    private Double f;
    private Double effGsm;
    private Double kg;
    private Double after;
    private String date;
    private String time;
    private String status;
    private String op;

    public CuttingJob() {}

    public CuttingJob(String no, String reel, String unit, Integer w, Integer l, Integer gsm, Integer sheets, Boolean corr, Double f, Double effGsm, Double kg, Double after, String date, String time, String status, String op) {
        this.no = no;
        this.reel = reel;
        this.unit = unit;
        this.w = w;
        this.l = l;
        this.gsm = gsm;
        this.sheets = sheets;
        this.corr = corr;
        this.f = f;
        this.effGsm = effGsm;
        this.kg = kg;
        this.after = after;
        this.date = date;
        this.time = time;
        this.status = status;
        this.op = op;
    }

    public String getNo() { return no; }
    public void setNo(String no) { this.no = no; }

    public String getReel() { return reel; }
    public void setReel(String reel) { this.reel = reel; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

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

    public Double getEffGsm() { return effGsm; }
    public void setEffGsm(Double effGsm) { this.effGsm = effGsm; }

    public Double getKg() { return kg; }
    public void setKg(Double kg) { this.kg = kg; }

    public Double getAfter() { return after; }
    public void setAfter(Double after) { this.after = after; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOp() { return op; }
    public void setOp(String op) { this.op = op; }

    public static CuttingJobBuilder builder() { return new CuttingJobBuilder(); }

    public static class CuttingJobBuilder {
        private String no;
        private String reel;
        private String unit;
        private Integer w;
        private Integer l;
        private Integer gsm;
        private Integer sheets;
        private Boolean corr;
        private Double f;
        private Double effGsm;
        private Double kg;
        private Double after;
        private String date;
        private String time;
        private String status;
        private String op;

        public CuttingJobBuilder no(String no) { this.no = no; return this; }
        public CuttingJobBuilder reel(String reel) { this.reel = reel; return this; }
        public CuttingJobBuilder unit(String unit) { this.unit = unit; return this; }
        public CuttingJobBuilder w(Integer w) { this.w = w; return this; }
        public CuttingJobBuilder l(Integer l) { this.l = l; return this; }
        public CuttingJobBuilder gsm(Integer gsm) { this.gsm = gsm; return this; }
        public CuttingJobBuilder sheets(Integer sheets) { this.sheets = sheets; return this; }
        public CuttingJobBuilder corr(Boolean corr) { this.corr = corr; return this; }
        public CuttingJobBuilder f(Double f) { this.f = f; return this; }
        public CuttingJobBuilder effGsm(Double effGsm) { this.effGsm = effGsm; return this; }
        public CuttingJobBuilder kg(Double kg) { this.kg = kg; return this; }
        public CuttingJobBuilder after(Double after) { this.after = after; return this; }
        public CuttingJobBuilder date(String date) { this.date = date; return this; }
        public CuttingJobBuilder time(String time) { this.time = time; return this; }
        public CuttingJobBuilder status(String status) { this.status = status; return this; }
        public CuttingJobBuilder op(String op) { this.op = op; return this; }

        public CuttingJob build() {
            return new CuttingJob(no, reel, unit, w, l, gsm, sheets, corr, f, effGsm, kg, after, date, time, status, op);
        }
    }
}
