package com.reeltrack.repository;

import com.reeltrack.model.ReelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReelTypeRepository extends JpaRepository<ReelType, String> {
    List<ReelType> findByActiveTrue();
}
