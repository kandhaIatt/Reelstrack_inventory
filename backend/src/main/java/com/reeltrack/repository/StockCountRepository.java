package com.reeltrack.repository;

import com.reeltrack.model.StockCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockCountRepository extends JpaRepository<StockCount, String> {
    java.util.List<StockCount> findByUnit(String unit);
}
