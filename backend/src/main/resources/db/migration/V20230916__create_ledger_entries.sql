-- Flyway migration: create ledger_entries table and ensure weight column precision
-- Version: V20230916__create_ledger_entries.sql

CREATE TABLE IF NOT EXISTS ledger_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reel_id VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15,4) NOT NULL,
    balance_after DECIMAL(15,4) NOT NULL,
    reference_type VARCHAR(100) NULL,
    reference_id VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    CONSTRAINT fk_ledger_reel FOREIGN KEY (reel_id) REFERENCES reels(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Ensure weight column on reels uses DECIMAL(15,4) for precision
ALTER TABLE reels MODIFY weight DECIMAL(15,4) NULL;
