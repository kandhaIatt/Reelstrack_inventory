package com.reeltrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.reeltrack.model.Mill;

@Repository
public interface MillRepository extends JpaRepository<Mill, String> {

    List<Mill> findByActiveTrue();

    List<Mill> findByActiveTrueOrderByNameAsc();
    List<Mill> findAllByOrderByNameAsc();
}
