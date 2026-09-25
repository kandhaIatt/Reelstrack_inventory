package com.reeltrack.repository;

import com.reeltrack.model.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    java.util.List<LedgerEntry> findByReelId(String reelId);
}
