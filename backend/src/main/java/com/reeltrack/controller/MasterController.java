package com.reeltrack.controller;

import com.reeltrack.model.*;
import com.reeltrack.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MasterController {

    private final UnitRepository unitRepository;
    private final MillRepository millRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public MasterController(UnitRepository unitRepository, MillRepository millRepository,
                            SupplierRepository supplierRepository, UserRepository userRepository) {
        this.unitRepository = unitRepository;
        this.millRepository = millRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getUnits() {
        return ResponseEntity.ok(unitRepository.findAll());
    }

    @GetMapping("/mills")
    public ResponseEntity<List<Mill>> getMills() {
        return ResponseEntity.ok(millRepository.findAll());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
