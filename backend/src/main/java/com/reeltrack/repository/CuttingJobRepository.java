package com.reeltrack.repository;

import com.reeltrack.model.CuttingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CuttingJobRepository extends JpaRepository<CuttingJob, String> {
    List<CuttingJob> findByReel(String reel);
    List<CuttingJob> findByUnit(String unit);
}
