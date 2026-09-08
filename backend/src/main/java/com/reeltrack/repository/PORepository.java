package com.reeltrack.repository;

import com.reeltrack.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PORepository extends JpaRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findBySupplier(String supplier);
    List<PurchaseOrder> findByUnit(String unit);
    List<PurchaseOrder> findByStatus(String status);
}
