package com.reeltrack.repository;

import com.reeltrack.model.ReelLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ReelLedgerRepository extends JpaRepository<ReelLedger, Long> {

    List<ReelLedger> findByReelIdOrderByTimestampDesc(Long reelId);

    List<ReelLedger> findByUnitIdOrderByTimestampDesc(String unitId);

    List<ReelLedger> findTop100ByOrderByTimestampDesc();

    @Query("SELECT COALESCE(SUM(l.deltaKg), 0.0) FROM ReelLedger l WHERE l.reelId = :reelId")
    BigDecimal sumDeltaByReelId(@Param("reelId") Long reelId);
}
