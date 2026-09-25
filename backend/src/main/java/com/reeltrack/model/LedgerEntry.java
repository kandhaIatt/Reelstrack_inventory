package com.reeltrack.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ledger_entries")
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reel_id", nullable = false)
    private String reelId;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private java.math.BigDecimal amount;

    @Column(nullable = false)
    private java.math.BigDecimal balanceAfter;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "created_by", nullable = false)
    private String createdBy = "system";

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReelId() { return reelId; }
    public void setReelId(String reelId) { this.reelId = reelId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }

    public java.math.BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(java.math.BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
