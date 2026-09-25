-- Flyway migration: add status to reels
-- Version: V20230917__add_status_to_reels.sql

ALTER TABLE reels ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE';
