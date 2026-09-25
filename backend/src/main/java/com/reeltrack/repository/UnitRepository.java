package com.reeltrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reeltrack.model.Unit;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {

    List<Unit> findByActiveTrue();

    List<Unit> findByActiveTrueOrderByNameAsc();
    List<Unit> findAllByOrderByNameAsc();
}
