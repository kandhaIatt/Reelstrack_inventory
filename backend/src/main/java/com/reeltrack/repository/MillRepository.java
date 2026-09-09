package com.reeltrack.repository;

import com.reeltrack.model.Mill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MillRepository extends JpaRepository<Mill, String> {
    List<Mill> findByActiveTrue();
}
