package com.reeltrack.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reel_ledger")
public class ReelLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String reelId;

    @Column(nullable = false)
    private String reelNumber;

    @Column(nullable = false)
    private String transactionType;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal deltaKg;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal runningBalanceKg;

    private String unitId;

    private String referenceId;

    private String actorId;

    private String actorName;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ReelLedger() {
        this.timestamp = LocalDateTime.now();
    }

    public ReelLedger(
            String reelId,
            String reelNumber,
            String transactionType,
            BigDecimal deltaKg,
            BigDecimal runningBalanceKg,
            String unitId,
            String referenceId,
            String actorId,
            String actorName,
            String notes) {

        this.reelId = reelId;
        this.reelNumber = reelNumber;
        this.transactionType = transactionType;
        this.deltaKg = deltaKg;
        this.runningBalanceKg = runningBalanceKg;
        this.unitId = unitId;
        this.referenceId = referenceId;
        this.actorId = actorId;
        this.actorName = actorName;
        this.notes = notes;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReelId() {
        return reelId;
    }

    public void setReelId(String reelId) {
        this.reelId = reelId;
    }

    public String getReelNumber() {
        return reelNumber;
    }

    public void setReelNumber(String reelNumber) {
        this.reelNumber = reelNumber;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getDeltaKg() {
        return deltaKg;
    }

    public void setDeltaKg(BigDecimal deltaKg) {
        this.deltaKg = deltaKg;
    }

    public BigDecimal getRunningBalanceKg() {
        return runningBalanceKg;
    }

    public void setRunningBalanceKg(BigDecimal runningBalanceKg) {
        this.runningBalanceKg = runningBalanceKg;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

