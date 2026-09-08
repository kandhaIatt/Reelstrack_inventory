package com.reeltrack.repository;

import com.reeltrack.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByReel(String reel);
    List<Transfer> findByFromUnitOrToUnit(String fromUnit, String toUnit);
}
