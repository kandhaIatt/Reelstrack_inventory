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
    private final ReelTypeRepository reelTypeRepository;
    private final BusinessConfigRepository businessConfigRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public MasterController(UnitRepository unitRepository, MillRepository millRepository,
                            ReelTypeRepository reelTypeRepository, BusinessConfigRepository businessConfigRepository,
                            SupplierRepository supplierRepository, UserRepository userRepository) {
        this.unitRepository = unitRepository;
        this.millRepository = millRepository;
        this.reelTypeRepository = reelTypeRepository;
        this.businessConfigRepository = businessConfigRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    // --- UNITS ---
    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getUnits(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(unitRepository.findByActiveTrue());
        }
        return ResponseEntity.ok(unitRepository.findAll());
    }

    @PostMapping("/units")
    public ResponseEntity<Unit> createUnit(@RequestBody Unit unit) {
        if (unit.getId() == null || unit.getId().isBlank()) {
            long count = unitRepository.count();
            unit.setId("U" + (count + 1));
        }
        if (unit.getActive() == null) {
            unit.setActive(true);
        }
        return ResponseEntity.ok(unitRepository.save(unit));
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable String id, @RequestBody Unit details) {
        return unitRepository.findById(id)
                .map(unit -> {
                    if (details.getName() != null) unit.setName(details.getName());
                    if (details.getCode() != null) unit.setCode(details.getCode());
                    if (details.getCity() != null) unit.setCity(details.getCity());
                    if (details.getStateCode() != null) unit.setStateCode(details.getStateCode());
                    if (details.getIncharge() != null) unit.setIncharge(details.getIncharge());
                    if (details.getTargetReels() != null) unit.setTargetReels(details.getTargetReels());
                    if (details.getTargetWeight() != null) unit.setTargetWeight(details.getTargetWeight());
                    if (details.getTargetJobs() != null) unit.setTargetJobs(details.getTargetJobs());
                    if (details.getActive() != null) unit.setActive(details.getActive());
                    return ResponseEntity.ok(unitRepository.save(unit));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/units/{id}/toggle-active")
    public ResponseEntity<Unit> toggleUnitActive(@PathVariable String id) {
        return unitRepository.findById(id)
                .map(unit -> {
                    unit.setActive(!Boolean.TRUE.equals(unit.getActive()));
                    return ResponseEntity.ok(unitRepository.save(unit));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- MILLS ---
    @GetMapping("/mills")
    public ResponseEntity<List<Mill>> getMills(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(millRepository.findByActiveTrue());
        }
        return ResponseEntity.ok(millRepository.findAll());
    }

    @PostMapping("/mills")
    public ResponseEntity<Mill> createMill(@RequestBody Mill mill) {
        if (mill.getId() == null || mill.getId().isBlank()) {
            long count = millRepository.count();
            mill.setId("M" + (count + 1));
        }
        if (mill.getActive() == null) {
            mill.setActive(true);
        }
        return ResponseEntity.ok(millRepository.save(mill));
    }

    @PutMapping("/mills/{id}")
    public ResponseEntity<Mill> updateMill(@PathVariable String id, @RequestBody Mill details) {
        return millRepository.findById(id)
                .map(mill -> {
                    if (details.getName() != null) mill.setName(details.getName());
                    if (details.getPlace() != null) mill.setPlace(details.getPlace());
                    if (details.getGrades() != null) mill.setGrades(details.getGrades());
                    if (details.getActive() != null) mill.setActive(details.getActive());
                    return ResponseEntity.ok(millRepository.save(mill));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/mills/{id}/toggle-active")
    public ResponseEntity<Mill> toggleMillActive(@PathVariable String id) {
        return millRepository.findById(id)
                .map(mill -> {
                    mill.setActive(!Boolean.TRUE.equals(mill.getActive()));
                    return ResponseEntity.ok(millRepository.save(mill));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- REEL TYPES ---
    @GetMapping("/reel-types")
    public ResponseEntity<List<ReelType>> getReelTypes(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(reelTypeRepository.findByActiveTrue());
        }
        return ResponseEntity.ok(reelTypeRepository.findAll());
    }

    @PostMapping("/reel-types")
    public ResponseEntity<ReelType> createReelType(@RequestBody ReelType reelType) {
        if (reelType.getId() == null || reelType.getId().isBlank()) {
            long count = reelTypeRepository.count();
            reelType.setId("RT-" + (count + 1));
        }
        if (reelType.getActive() == null) {
            reelType.setActive(true);
        }
        return ResponseEntity.ok(reelTypeRepository.save(reelType));
    }

    @PutMapping("/reel-types/{id}")
    public ResponseEntity<ReelType> updateReelType(@PathVariable String id, @RequestBody ReelType details) {
        return reelTypeRepository.findById(id)
                .map(type -> {
                    if (details.getName() != null) type.setName(details.getName());
                    if (details.getDefaultGsm() != null) type.setDefaultGsm(details.getDefaultGsm());
                    if (details.getDefaultBf() != null) type.setDefaultBf(details.getDefaultBf());
                    if (details.getActive() != null) type.setActive(details.getActive());
                    return ResponseEntity.ok(reelTypeRepository.save(type));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/reel-types/{id}/toggle-active")
    public ResponseEntity<ReelType> toggleReelTypeActive(@PathVariable String id) {
        return reelTypeRepository.findById(id)
                .map(type -> {
                    type.setActive(!Boolean.TRUE.equals(type.getActive()));
                    return ResponseEntity.ok(reelTypeRepository.save(type));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- BUSINESS CONFIG ---
    @GetMapping("/config")
    public ResponseEntity<BusinessConfig> getConfig() {
        BusinessConfig config = businessConfigRepository.findById("DEFAULT")
                .orElseGet(() -> businessConfigRepository.save(new BusinessConfig()));
        return ResponseEntity.ok(config);
    }

    @PutMapping("/config")
    public ResponseEntity<BusinessConfig> updateConfig(@RequestBody BusinessConfig details) {
        BusinessConfig config = businessConfigRepository.findById("DEFAULT")
                .orElseGet(() -> new BusinessConfig());
        if (details.getReelNumberFormat() != null) config.setReelNumberFormat(details.getReelNumberFormat());
        if (details.getCorrugationFactor() != null) config.setCorrugationFactor(details.getCorrugationFactor());
        if (details.getPoNumberFormat() != null) config.setPoNumberFormat(details.getPoNumberFormat());
        if (details.getDefaultGstRate() != null) config.setDefaultGstRate(details.getDefaultGstRate());
        return ResponseEntity.ok(businessConfigRepository.save(config));
    }

    // --- OTHER MASTERS ---
    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierRepository.findAll());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
