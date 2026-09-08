package com.reeltrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reeltrack.model.Reel;

@Repository
public interface ReelRepository extends JpaRepository<Reel, String> {
    List<Reel> findByUnit(String unit);
    List<Reel> findByPo(String po);
    Optional<Reel> findTopByOrderByIdDesc();
}
