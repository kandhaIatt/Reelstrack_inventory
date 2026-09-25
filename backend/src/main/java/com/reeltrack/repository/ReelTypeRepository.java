package com.reeltrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reeltrack.model.ReelType;
@Repository
public interface ReelTypeRepository extends JpaRepository<ReelType, String> {
   List<ReelType> findByActiveTrue();
   List<ReelType> findAllByOrderByNameAsc();
   List<ReelType> findByActiveTrueOrderByNameAsc();
   Optional<ReelType> findByNameIgnoreCase(String name);
}
