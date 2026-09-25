package com.reeltrack.service;

import com.reeltrack.dto.MasterDTOs.*;
import com.reeltrack.model.*;
import com.reeltrack.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MasterDataService {

    private final UnitRepository unitRepository;
    private final MillRepository millRepository;
    private final ReelTypeRepository reelTypeRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final BusinessConfigRepository businessConfigRepository;
    private final AppSettingRepository appSettingRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public MasterDataService(
            UnitRepository unitRepository,
            MillRepository millRepository,
            ReelTypeRepository reelTypeRepository,
            SupplierRepository supplierRepository,
            UserRepository userRepository,
            BusinessConfigRepository businessConfigRepository,
            AppSettingRepository appSettingRepository,
            ActivityLogRepository activityLogRepository,
            PasswordEncoder passwordEncoder) {
        this.unitRepository = unitRepository;
        this.millRepository = millRepository;
        this.reelTypeRepository = reelTypeRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.businessConfigRepository = businessConfigRepository;
        this.appSettingRepository = appSettingRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==========================================
    // UNITS
    // ==========================================
    public List<Unit> getUnits(Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return unitRepository.findByActiveTrue();
        }
        return unitRepository.findAllByOrderByNameAsc();
    }

    public Optional<Unit> getUnitById(String id) {
        return unitRepository.findById(id);
    }

    public Unit saveUnit(UnitRequest r) {
        String unitId = r.getId();
        if (unitId == null || unitId.isBlank()) {
            unitId = "U" + (unitRepository.count() + 1);
        }

        Unit unit = unitRepository.findById(unitId).orElse(new Unit());
        unit.setId(unitId);
        unit.setName(r.getName());
        unit.setCode(r.getCode());
        unit.setCity(r.getCity());
        unit.setStateCode(r.getStateCode());
        unit.setIncharge(r.getIncharge());
        unit.setTargetReels(r.getTargetReels());
        unit.setTargetWeight(r.getTargetWeight());
        unit.setTargetJobs(r.getTargetJobs());
        unit.setActive(r.getActive() != null ? r.getActive() : true);

        Unit saved = unitRepository.save(unit);
        logActivity("Building", "ok", "Unit Saved: " + saved.getName(), "Code: " + saved.getCode() + " · City: " + saved.getCity());
        return saved;
    }

    public Unit updateUnit(String id, Unit details) {
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
                    Unit saved = unitRepository.save(unit);
                    logActivity("Building", "info", "Unit Updated: " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
    }

    public Unit toggleUnitActive(String id) {
        return setUnitActive(id, null);
    }

    public Unit setUnitActive(String id, Boolean active) {
        return unitRepository.findById(id)
                .map(unit -> {
                    boolean nextActive = active != null ? active : !Boolean.TRUE.equals(unit.getActive());
                    unit.setActive(nextActive);
                    Unit saved = unitRepository.save(unit);
                    logActivity("Building", saved.getActive() ? "ok" : "warn",
                            "Unit " + (saved.getActive() ? "Activated" : "Deactivated") + ": " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
    }

    public void deleteUnit(String id) {
        unitRepository.deleteById(id);
        logActivity("Trash2", "warn", "Unit Deleted", "ID: " + id);
    }

    // ==========================================
    // MILLS
    // ==========================================
    public List<Mill> getMills(Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return millRepository.findByActiveTrue();
        }
        return millRepository.findAllByOrderByNameAsc();
    }

    public Optional<Mill> getMillById(String id) {
        return millRepository.findById(id);
    }

    public Mill saveMill(MillRequest r) {
        String millId = r.getId();
        if (millId == null || millId.isBlank()) {
            millId = "M" + (millRepository.count() + 1);
        }

        Mill mill = millRepository.findById(millId).orElse(new Mill());
        mill.setId(millId);
        mill.setName(r.getName());
        mill.setPlace(r.getPlace());
        mill.setGrades(r.getGrades());
        mill.setActive(r.getActive() != null ? r.getActive() : true);

        Mill saved = millRepository.save(mill);
        logActivity("Building", "ok", "Mill Saved: " + saved.getName(), "Place: " + saved.getPlace());
        return saved;
    }

    public Mill updateMill(String id, Mill details) {
        return millRepository.findById(id)
                .map(mill -> {
                    if (details.getName() != null) mill.setName(details.getName());
                    if (details.getPlace() != null) mill.setPlace(details.getPlace());
                    if (details.getGrades() != null) mill.setGrades(details.getGrades());
                    if (details.getActive() != null) mill.setActive(details.getActive());
                    Mill saved = millRepository.save(mill);
                    logActivity("Building", "info", "Mill Updated: " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Mill not found: " + id));
    }

    public Mill toggleMillActive(String id) {
        return setMillActive(id, null);
    }

    public Mill setMillActive(String id, Boolean active) {
        return millRepository.findById(id)
                .map(mill -> {
                    boolean nextActive = active != null ? active : !Boolean.TRUE.equals(mill.getActive());
                    mill.setActive(nextActive);
                    Mill saved = millRepository.save(mill);
                    logActivity("Building", saved.getActive() ? "ok" : "warn",
                            "Mill " + (saved.getActive() ? "Activated" : "Deactivated") + ": " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Mill not found: " + id));
    }

    public void deleteMill(String id) {
        millRepository.deleteById(id);
        logActivity("Trash2", "warn", "Mill Deleted", "ID: " + id);
    }

    // ==========================================
    // REEL TYPES
    // ==========================================
    public List<ReelType> getReelTypes(Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return reelTypeRepository.findByActiveTrue();
        }
        return reelTypeRepository.findAllByOrderByNameAsc();
    }

    public Optional<ReelType> getReelTypeById(String id) {
        return reelTypeRepository.findById(id);
    }

    public ReelType saveReelType(ReelTypeRequest r) {
        String typeId = r.getId();
        if (typeId == null || typeId.isBlank()) {
            typeId = "RT-" + (reelTypeRepository.count() + 1);
        }

        ReelType reelType = reelTypeRepository.findById(typeId).orElse(new ReelType());
        reelType.setId(typeId);
        reelType.setName(r.getName());
        reelType.setDefaultGsm(r.getDefaultGsm());
        reelType.setDefaultBf(r.getDefaultBf());
        reelType.setActive(r.getActive() != null ? r.getActive() : true);

        ReelType saved = reelTypeRepository.save(reelType);
        logActivity("Layers", "ok", "Reel Type Saved: " + saved.getName(), "GSM: " + saved.getDefaultGsm() + " · BF: " + saved.getDefaultBf());
        return saved;
    }

    public ReelType updateReelType(String id, ReelType details) {
        return reelTypeRepository.findById(id)
                .map(type -> {
                    if (details.getName() != null) type.setName(details.getName());
                    if (details.getDefaultGsm() != null) type.setDefaultGsm(details.getDefaultGsm());
                    if (details.getDefaultBf() != null) type.setDefaultBf(details.getDefaultBf());
                    if (details.getActive() != null) type.setActive(details.getActive());
                    ReelType saved = reelTypeRepository.save(type);
                    logActivity("Layers", "info", "Reel Type Updated: " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Reel Type not found: " + id));
    }

    public ReelType toggleReelTypeActive(String id) {
        return setReelTypeActive(id, null);
    }

    public ReelType setReelTypeActive(String id, Boolean active) {
        return reelTypeRepository.findById(id)
                .map(type -> {
                    boolean nextActive = active != null ? active : !Boolean.TRUE.equals(type.getActive());
                    type.setActive(nextActive);
                    ReelType saved = reelTypeRepository.save(type);
                    logActivity("Layers", saved.getActive() ? "ok" : "warn",
                            "Reel Type " + (saved.getActive() ? "Activated" : "Deactivated") + ": " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Reel Type not found: " + id));
    }

    public void deleteReelType(String id) {
        reelTypeRepository.deleteById(id);
        logActivity("Trash2", "warn", "Reel Type Deleted", "ID: " + id);
    }

    // ==========================================
    // SUPPLIERS
    // ==========================================
    public List<Supplier> getSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(String id) {
        return supplierRepository.findById(id);
    }

    public Supplier saveSupplier(SupplierRequest r) {
        String supplierId = r.getId();
        if (supplierId == null || supplierId.isBlank()) {
            supplierId = "S" + (supplierRepository.count() + 1);
        }

        Supplier supplier = supplierRepository.findById(supplierId).orElse(new Supplier());
        supplier.setId(supplierId);
        supplier.setName(r.getName());
        supplier.setMill(r.getMill());
        supplier.setGst(r.getGst());
        supplier.setContact(r.getContact());
        supplier.setPhone(r.getPhone());
        supplier.setTerms(r.getTerms());

        Supplier saved = supplierRepository.save(supplier);
        logActivity("Truck", "ok", "Supplier Saved: " + saved.getName(), "Contact: " + saved.getContact());
        return saved;
    }

    public Supplier updateSupplier(String id, Supplier details) {
        return supplierRepository.findById(id)
                .map(supplier -> {
                    if (details.getName() != null) supplier.setName(details.getName());
                    if (details.getMill() != null) supplier.setMill(details.getMill());
                    if (details.getGst() != null) supplier.setGst(details.getGst());
                    if (details.getContact() != null) supplier.setContact(details.getContact());
                    if (details.getPhone() != null) supplier.setPhone(details.getPhone());
                    if (details.getTerms() != null) supplier.setTerms(details.getTerms());
                    Supplier saved = supplierRepository.save(supplier);
                    logActivity("Truck", "info", "Supplier Updated: " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + id));
    }

    public Supplier setSupplierActive(String id, Boolean active) {
        return supplierRepository.findById(id)
                .map(supplier -> {
                    boolean nextActive = active != null ? active : !Boolean.TRUE.equals(supplier.getActive());
                    supplier.setActive(nextActive);
                    Supplier saved = supplierRepository.save(supplier);
                    logActivity("Truck", saved.getActive() ? "ok" : "warn",
                            "Supplier " + (saved.getActive() ? "Activated" : "Deactivated") + ": " + saved.getName(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + id));
    }

    public void deleteSupplier(String id) {
        supplierRepository.deleteById(id);
        logActivity("Trash2", "warn", "Supplier Deleted", "ID: " + id);
    }

    // ==========================================
    // USERS
    // ==========================================
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(UserRequest r) {
        if (userRepository.findByUsernameIgnoreCase(r.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken: " + r.getUsername());
        }

        Role role = Role.USER;
        if (r.getRole() != null) {
            try {
                role = Role.valueOf(r.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        String encodedPassword = passwordEncoder.encode(r.getPassword() != null && !r.getPassword().isBlank() ? r.getPassword() : "Welcome123!");

        User user = User.builder()
                .username(r.getUsername())
                .name(r.getName())
                .password(encodedPassword)
                .role(role)
                .unitId(r.getUnitId())
                .email(r.getEmail())
                .mobile(r.getMobile())
                .active(r.getActive() != null ? r.getActive() : true)
                .build();

        User saved = userRepository.save(user);
        logActivity("Users", "ok", "User Created: " + saved.getUsername(), "Role: " + saved.getRole() + " · Unit: " + saved.getUnitId());
        return saved;
    }

    public User updateUser(Long id, UserRequest r, String currentUsername) {
        return userRepository.findById(id)
                .map(user -> {
                    if (r.getName() != null) user.setName(r.getName());
                    if (r.getEmail() != null) user.setEmail(r.getEmail());
                    if (r.getMobile() != null) user.setMobile(r.getMobile());
                    if (r.getUnitId() != null) user.setUnitId(r.getUnitId());
                    if (r.getActive() != null) user.setActive(r.getActive());
                    if (r.getRole() != null) {
                        try {
                            Role newRole = Role.valueOf(r.getRole().toUpperCase());
                            if (user.getRole() != newRole) {
                                if (user.getUsername().equalsIgnoreCase(currentUsername)) {
                                    throw new IllegalArgumentException("Users cannot change their own role.");
                                }
                                user.setRole(newRole);
                            }
                        } catch (IllegalArgumentException e) {
                            if (e.getMessage().equals("Users cannot change their own role.")) throw e;
                        } catch (Exception ignored) {}
                    }
                    if (r.getPassword() != null && !r.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(r.getPassword()));
                    }
                    User saved = userRepository.save(user);
                    logActivity("Users", "info", "User Updated: " + saved.getUsername(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public User toggleUserActive(Long id) {
        return setUserActive(id, null);
    }

    public User setUserActive(Long id, Boolean active) {
        return userRepository.findById(id)
                .map(user -> {
                    boolean nextActive = active != null ? active : !user.isActive();
                    user.setActive(nextActive);
                    User saved = userRepository.save(user);
                    logActivity("Users", saved.isActive() ? "ok" : "warn",
                            "User " + (saved.isActive() ? "Activated" : "Deactivated") + ": " + saved.getUsername(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public User changeUserPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 8 || !newPassword.matches(".*[A-Z].*") || !newPassword.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new IllegalArgumentException("Password must be at least 8 characters with one uppercase letter and one special character.");
        }

        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setPasswordChangeRequired(false);
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    User saved = userRepository.save(user);
                    logActivity("Users", "ok", "Password Changed for User: " + saved.getUsername(), "ID: " + id);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
        logActivity("Trash2", "warn", "User Deleted", "ID: " + id);
    }

    // ==========================================
    // CONFIG & SETTINGS
    // ==========================================
    public BusinessConfig getConfig() {
        return businessConfigRepository.findById("DEFAULT")
                .orElseGet(() -> businessConfigRepository.save(new BusinessConfig()));
    }

    public BusinessConfig updateConfig(BusinessConfig details) {
        BusinessConfig config = businessConfigRepository.findById("DEFAULT")
                .orElseGet(BusinessConfig::new);
        if (details.getReelNumberFormat() != null) config.setReelNumberFormat(details.getReelNumberFormat());
        if (details.getCorrugationFactor() != null) config.setCorrugationFactor(details.getCorrugationFactor());
        if (details.getPoNumberFormat() != null) config.setPoNumberFormat(details.getPoNumberFormat());
        if (details.getDefaultGstRate() != null) config.setDefaultGstRate(details.getDefaultGstRate());
        BusinessConfig saved = businessConfigRepository.save(config);
        logActivity("Settings", "info", "System Configuration Updated", "Corrugation: " + saved.getCorrugationFactor());
        return saved;
    }

    public List<AppSetting> getSettings() {
        return appSettingRepository.findAll();
    }

    public AppSetting saveSetting(String key, String value) {
        AppSetting setting = appSettingRepository.findById(key).orElse(new AppSetting());
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        AppSetting saved = appSettingRepository.save(setting);
        logActivity("Settings", "info", "Setting Updated: " + key, "Value: " + value);
        return saved;
    }

    private void logActivity(String icon, String tone, String title, String sub) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .icon(icon)
                    .tone(tone)
                    .title(title)
                    .sub(sub)
                    .time(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")))
                    .timestamp(LocalDateTime.now())
                    .build();
            activityLogRepository.save(log);
        } catch (Exception ignored) {
            // Do not fail master transactions if audit log fails
        }
    }
}
