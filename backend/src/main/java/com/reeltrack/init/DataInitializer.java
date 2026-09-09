package com.reeltrack.init;

import com.reeltrack.model.*;
import com.reeltrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final MillRepository millRepository;
    private final ReelTypeRepository reelTypeRepository;
    private final BusinessConfigRepository businessConfigRepository;
    private final SupplierRepository supplierRepository;
    private final ReelRepository reelRepository;
    private final CuttingJobRepository jobRepository;
    private final PORepository poRepository;
    private final TransferRepository transferRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, UnitRepository unitRepository,
                           MillRepository millRepository, ReelTypeRepository reelTypeRepository,
                           BusinessConfigRepository businessConfigRepository, SupplierRepository supplierRepository,
                           ReelRepository reelRepository, CuttingJobRepository jobRepository,
                           PORepository poRepository, TransferRepository transferRepository,
                           ActivityLogRepository activityLogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.unitRepository = unitRepository;
        this.millRepository = millRepository;
        this.reelTypeRepository = reelTypeRepository;
        this.businessConfigRepository = businessConfigRepository;
        this.supplierRepository = supplierRepository;
        this.reelRepository = reelRepository;
        this.jobRepository = jobRepository;
        this.poRepository = poRepository;
        this.transferRepository = transferRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        // 1. Users
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("password123"))
                .name("Arun Kumar")
                .role(Role.ADMIN)
                .unitId("HO")
                .email("admin@reeltrack.com")
                .build();

        User operator = User.builder()
                .username("operator")
                .password(passwordEncoder.encode("password123"))
                .name("R. Karthik")
                .role(Role.OPERATOR)
                .unitId("U1")
                .email("karthik@reeltrack.com")
                .build();

        User operatorBlr = User.builder()
                .username("operator_blr")
                .password(passwordEncoder.encode("password123"))
                .name("S. Prakash")
                .role(Role.OPERATOR)
                .unitId("U2")
                .email("prakash@reeltrack.com")
                .build();

        userRepository.saveAll(Arrays.asList(admin, operator, operatorBlr));

        // 2. Units
        unitRepository.saveAll(Arrays.asList(
                Unit.builder().id("U1").name("Chennai Unit").code("CHN").city("Chennai").stateCode("TN").incharge("R. Karthik").targetReels(32).targetWeight(8420.0).targetJobs(4).active(true).build(),
                Unit.builder().id("U2").name("Bangalore Unit").code("BLR").city("Bengaluru").stateCode("KA").incharge("S. Prakash").targetReels(24).targetWeight(6850.0).targetJobs(3).active(true).build(),
                Unit.builder().id("U3").name("Hyderabad Unit").code("HYD").city("Hyderabad").stateCode("AP").incharge("M. Venkatesh").targetReels(18).targetWeight(5230.0).targetJobs(2).active(true).build(),
                Unit.builder().id("U4").name("Coimbatore Unit").code("CBE").city("Coimbatore").stateCode("TN").incharge("A. Devaraj").targetReels(21).targetWeight(5940.0).targetJobs(2).active(true).build(),
                Unit.builder().id("U5").name("Pondicherry Unit").code("PDY").city("Puducherry").stateCode("PY").incharge("J. Anbarasan").targetReels(17).targetWeight(4610.0).targetJobs(2).active(true).build(),
                Unit.builder().id("U6").name("Madurai Unit").code("MDU").city("Madurai").stateCode("TN").incharge("K. Sathish").targetReels(16).targetWeight(4230.0).targetJobs(1).active(true).build()
        ));

        // 3. Mills
        millRepository.saveAll(Arrays.asList(
                Mill.builder().id("M1").name("Suvarna Durga").place("Rajahmundry, AP").grades("Kraft 90–180 GSM").active(true).build(),
                Mill.builder().id("M2").name("ABC Papers").place("Sivakasi, TN").grades("Kraft & Duplex").active(true).build(),
                Mill.builder().id("M3").name("Sri Lakshmi Papers").place("Nellore, AP").grades("Semi-Kraft, Duplex").active(true).build(),
                Mill.builder().id("M4").name("Tamil Nadu Kraft").place("Karur, TN").grades("Kraft 100–160 GSM").active(true).build(),
                Mill.builder().id("M5").name("South India Paper Mills").place("Mysuru, KA").grades("High BF Kraft").active(true).build()
        ));

        // 4. Reel Types
        reelTypeRepository.saveAll(Arrays.asList(
                ReelType.builder().id("RT-1").name("Kraft").defaultGsm(120).defaultBf(18).active(true).build(),
                ReelType.builder().id("RT-2").name("Semi-Kraft").defaultGsm(100).defaultBf(16).active(true).build(),
                ReelType.builder().id("RT-3").name("Duplex Board").defaultGsm(150).defaultBf(0).active(true).build(),
                ReelType.builder().id("RT-4").name("Test Liner").defaultGsm(130).defaultBf(18).active(true).build(),
                ReelType.builder().id("RT-5").name("Golden Kraft").defaultGsm(140).defaultBf(22).active(true).build()
        ));

        // 5. Business Configuration
        businessConfigRepository.save(
                BusinessConfig.builder()
                        .id("DEFAULT")
                        .reelNumberFormat("R-{SEQ}")
                        .corrugationFactor(0.45)
                        .poNumberFormat("PO-2026-{SEQ:4}")
                        .defaultGstRate(18.0)
                        .build()
        );

        // 6. Suppliers
        supplierRepository.saveAll(Arrays.asList(
                Supplier.builder().id("S1").name("Suvarna Durga Paper Mills").mill("Suvarna Durga").gst("37AAECS1234K1Z9").contact("V. Ramana").phone("+91 98490 22114").terms("30 Days").build(),
                Supplier.builder().id("S2").name("ABC Papers Pvt Ltd").mill("ABC Papers").gst("33AABCA5566P1ZT").contact("N. Selvam").phone("+91 94433 78120").terms("45 Days").build(),
                Supplier.builder().id("S3").name("Sri Lakshmi Papers").mill("Sri Lakshmi Papers").gst("37AAKFS9087R1ZB").contact("P. Srinivas").phone("+91 90000 41277").terms("30 Days").build(),
                Supplier.builder().id("S4").name("Tamil Nadu Kraft Industries").mill("Tamil Nadu Kraft").gst("33AAFCT3311M1Z5").contact("G. Muthu").phone("+91 98942 55031").terms("15 Days").build(),
                Supplier.builder().id("S5").name("South India Paper Mills").mill("South India Paper Mills").gst("29AACCS7788L1ZQ").contact("H. Bhaskar").phone("+91 99001 63344").terms("60 Days").build(),
                Supplier.builder().id("S6").name("Coastal Board Mills").mill("ABC Papers").gst("37AAGCC2244N1ZW").contact("D. Ravi").phone("+91 91210 90876").terms("30 Days").build(),
                Supplier.builder().id("S7").name("Vensun Packaging Supplies").mill("Sri Lakshmi Papers").gst("33AACCV6612H1ZR").contact("B. Jeyanthi").phone("+91 87545 12009").terms("Advance").build(),
                Supplier.builder().id("S8").name("Kaveri Paper Traders").mill("Tamil Nadu Kraft").gst("33AAJFK4590C1ZD").contact("T. Ilango").phone("+91 96770 33418").terms("45 Days").build()
        ));

        // 7. Reels
        List<Reel> reels = Arrays.asList(
                Reel.builder().id("R-21056").type("Kraft").gsm(120).bf(18).width(80).orig(412.0).remaining(412.0).mill("Suvarna Durga").unit("U1").rec("05 Aug 2026").po("PO-2026-0045").build(),
                Reel.builder().id("R-21057").type("Kraft").gsm(140).bf(20).width(80).orig(426.0).remaining(261.36).mill("Suvarna Durga").unit("U1").rec("02 Aug 2026").po("PO-2026-0044").build(),
                Reel.builder().id("R-21058").type("Kraft").gsm(100).bf(16).width(90).orig(388.0).remaining(388.0).mill("ABC Papers").unit("U2").rec("01 Aug 2026").po("PO-2026-0044").build(),
                Reel.builder().id("R-21059").type("Duplex Board").gsm(150).bf(0).width(70).orig(455.0).remaining(148.75).mill("Sri Lakshmi Papers").unit("U1").rec("28 Jul 2026").po("PO-2026-0042").build(),
                Reel.builder().id("R-21060").type("Kraft").gsm(120).bf(18).width(80).orig(402.0).remaining(57.25).mill("Tamil Nadu Kraft").unit("U3").rec("26 Jul 2026").po("PO-2026-0042").build(),
                Reel.builder().id("R-21061").type("Kraft").gsm(180).bf(22).width(100).orig(512.0).remaining(440.0).mill("South India Paper Mills").unit("U2").rec("24 Jul 2026").po("PO-2026-0041").build(),
                Reel.builder().id("R-21062").type("Kraft").gsm(90).bf(14).width(80).orig(356.0).remaining(193.375).mill("ABC Papers").unit("U4").rec("22 Jul 2026").po("PO-2026-0041").build(),
                Reel.builder().id("R-21063").type("Kraft").gsm(120).bf(18).width(80).orig(412.0).remaining(95.632).mill("Suvarna Durga").unit("U1").rec("20 Jul 2026").po("PO-2026-0040").build(),
                Reel.builder().id("R-21064").type("Semi-Kraft").gsm(110).bf(16).width(85).orig(372.0).remaining(372.0).mill("Sri Lakshmi Papers").unit("U6").rec("18 Jul 2026").po("PO-2026-0040").build(),
                Reel.builder().id("R-21065").type("Kraft").gsm(140).bf(20).width(80).orig(430.0).remaining(107.03).mill("Tamil Nadu Kraft").unit("U5").rec("16 Jul 2026").po("PO-2026-0039").build(),
                Reel.builder().id("R-21066").type("Kraft").gsm(160).bf(20).width(95).orig(486.0).remaining(486.0).mill("South India Paper Mills").unit("U1").rec("14 Jul 2026").po("PO-2026-0039").build(),
                Reel.builder().id("R-21067").type("Duplex Board").gsm(200).bf(0).width(70).orig(512.0).remaining(372.0).mill("ABC Papers").unit("U2").rec("12 Jul 2026").po("PO-2026-0038").build(),
                Reel.builder().id("R-21068").type("Kraft").gsm(120).bf(18).width(80).orig(415.0).remaining(415.0).mill("Suvarna Durga").unit("U3").rec("10 Jul 2026").po("PO-2026-0038").build(),
                Reel.builder().id("R-21069").type("Kraft").gsm(100).bf(16).width(90).orig(364.0).remaining(191.71).mill("Sri Lakshmi Papers").unit("U4").rec("08 Jul 2026").po("PO-2026-0037").build(),
                Reel.builder().id("R-21070").type("Test Liner").gsm(130).bf(18).width(85).orig(398.0).remaining(398.0).mill("Tamil Nadu Kraft").unit("U1").rec("06 Jul 2026").po("PO-2026-0037").build(),
                Reel.builder().id("R-21071").type("Kraft").gsm(150).bf(20).width(80).orig(452.0).remaining(282.64).mill("South India Paper Mills").unit("U2").rec("04 Jul 2026").po("PO-2026-0036").build(),
                Reel.builder().id("R-21072").type("Kraft").gsm(120).bf(18).width(80).orig(408.0).remaining(39.677).mill("ABC Papers").unit("U6").rec("02 Jul 2026").po("PO-2026-0036").build(),
                Reel.builder().id("R-21078").type("Kraft").gsm(120).bf(18).width(80).orig(412.0).remaining(412.0).mill("Suvarna Durga").unit("U1").rec("10 Aug 2026").po("PO-2026-0045").build()
        );
        reelRepository.saveAll(reels);

        // 8. Cutting Jobs
        List<CuttingJob> jobs = Arrays.asList(
                CuttingJob.builder().no("JOB-001").reel("R-21063").unit("U1").w(80).l(63).gsm(120).sheets(3000).corr(true).f(0.45).effGsm(174.0).kg(263.088).after(148.912).date("11 Aug 2026").time("11:42 AM").status("Completed").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-002").reel("R-21063").unit("U1").w(80).l(64).gsm(120).sheets(1000).corr(false).f(0.0).effGsm(120.0).kg(61.44).after(87.472).date("11 Aug 2026").time("02:15 PM").status("Completed").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-003").reel("R-21057").unit("U1").w(80).l(70).gsm(140).sheets(1500).corr(true).f(0.40).effGsm(196.0).kg(164.64).after(261.36).date("10 Aug 2026").time("09:20 AM").status("Completed").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-004").reel("R-21061").unit("U2").w(100).l(80).gsm(180).sheets(500).corr(false).f(0.0).effGsm(180.0).kg(72.0).after(440.0).date("10 Aug 2026").time("10:05 AM").status("Completed").op("S. Prakash").build(),
                CuttingJob.builder().no("JOB-005").reel("R-21062").unit("U4").w(80).l(60).gsm(90).sheets(2500).corr(true).f(0.45).effGsm(130.5).kg(156.6).after(199.4).date("09 Aug 2026").time("04:40 PM").status("Completed").op("A. Devaraj").build(),
                CuttingJob.builder().no("JOB-006").reel("R-21059").unit("U1").w(70).l(50).gsm(150).sheets(4000).corr(false).f(0.0).effGsm(150.0).kg(210.0).after(245.0).date("08 Aug 2026").time("11:00 AM").status("Completed").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-007").reel("R-21059").unit("U1").w(70).l(55).gsm(150).sheets(2000).corr(true).f(0.45).effGsm(217.5).kg(167.475).after(77.525).date("08 Aug 2026").time("03:30 PM").status("Completed").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-008").reel("R-21060").unit("U3").w(80).l(62).gsm(120).sheets(3000).corr(true).f(0.45).effGsm(174.0).kg(258.912).after(143.088).date("07 Aug 2026").time("09:55 AM").status("Completed").op("M. Venkatesh").build(),
                CuttingJob.builder().no("JOB-009").reel("R-21060").unit("U3").w(80).l(62).gsm(120).sheets(1600).corr(true).f(0.45).effGsm(174.0).kg(138.086).after(4.99).date("07 Aug 2026").time("01:20 PM").status("Completed").op("M. Venkatesh").build(),
                CuttingJob.builder().no("JOB-010").reel("R-21060").unit("U3").w(80).l(62).gsm(120).sheets(57).corr(true).f(0.45).effGsm(174.0).kg(4.919).after(0.071).date("07 Aug 2026").time("05:10 PM").status("Completed").op("M. Venkatesh").build(),
                CuttingJob.builder().no("JOB-011").reel("R-21065").unit("U5").w(80).l(66).gsm(140).sheets(2000).corr(true).f(0.45).effGsm(203.0).kg(214.368).after(215.632).date("06 Aug 2026").time("10:30 AM").status("Completed").op("J. Anbarasan").build(),
                CuttingJob.builder().no("JOB-012").reel("R-21065").unit("U5").w(80).l(66).gsm(140).sheets(900).corr(true).f(0.45).effGsm(203.0).kg(96.465).after(119.167).date("06 Aug 2026").time("02:45 PM").status("Completed").op("J. Anbarasan").build(),
                CuttingJob.builder().no("JOB-013").reel("R-21065").unit("U5").w(80).l(66).gsm(140).sheets(200).corr(true).f(0.45).effGsm(203.0).kg(21.436).after(97.731).date("05 Aug 2026").time("04:00 PM").status("Completed").op("J. Anbarasan").build(),
                CuttingJob.builder().no("JOB-014").reel("R-21067").unit("U2").w(70).l(50).gsm(200).sheets(2000).corr(false).f(0.0).effGsm(200.0).kg(140.0).after(372.0).date("05 Aug 2026").time("11:25 AM").status("Completed").op("S. Prakash").build(),
                CuttingJob.builder().no("JOB-015").reel("R-21069").unit("U4").w(90).l(60).gsm(100).sheets(2200).corr(true).f(0.45).effGsm(145.0).kg(172.26).after(191.74).date("04 Aug 2026").time("09:15 AM").status("Completed").op("A. Devaraj").build(),
                CuttingJob.builder().no("JOB-016").reel("R-21071").unit("U2").w(80).l(72).gsm(150).sheets(1400).corr(true).f(0.40).effGsm(210.0).kg(169.344).after(282.656).date("03 Aug 2026").time("12:05 PM").status("Completed").op("S. Prakash").build(),
                CuttingJob.builder().no("JOB-017").reel("R-21072").unit("U6").w(80).l(63).gsm(120).sheets(3000).corr(true).f(0.45).effGsm(174.0).kg(263.088).after(144.912).date("02 Aug 2026").time("10:40 AM").status("Completed").op("K. Sathish").build(),
                CuttingJob.builder().no("JOB-018").reel("R-21072").unit("U6").w(80).l(63).gsm(120).sheets(1200).corr(true).f(0.45).effGsm(174.0).kg(105.235).after(39.677).date("02 Aug 2026").time("03:55 PM").status("Completed").op("K. Sathish").build(),
                CuttingJob.builder().no("JOB-019").reel("R-21066").unit("U1").w(95).l(70).gsm(160).sheets(800).corr(true).f(0.45).effGsm(232.0).kg(123.424).after(362.576).date("11 Aug 2026").time("08:30 AM").status("In Progress").op("R. Karthik").build(),
                CuttingJob.builder().no("JOB-020").reel("R-21064").unit("U6").w(85).l(60).gsm(110).sheets(1500).corr(false).f(0.0).effGsm(110.0).kg(84.15).after(287.85).date("11 Aug 2026").time("09:10 AM").status("In Progress").op("K. Sathish").build()
        );
        jobRepository.saveAll(jobs);

        // 9. Purchase Orders
        PurchaseOrder po48 = PurchaseOrder.builder()
                .id("PO-2026-0048").supplier("S1").unit("U1").date("11 Aug 2026").eta("18 Aug 2026").terms("30 Days")
                .status("Pending Approval").received(0).raisedBy("Admin (Head Office)").notes("Urgent top-up for corrugation line 2.")
                .items(Arrays.asList(
                        POItem.builder().type("Kraft").gsm(120).width(80).bf(18).qty(2).kg(824.0).rate(38.0).build(),
                        POItem.builder().type("Kraft").gsm(140).width(80).bf(20).qty(1).kg(426.0).rate(40.0).build()
                )).build();

        PurchaseOrder po47 = PurchaseOrder.builder()
                .id("PO-2026-0047").supplier("S2").unit("U2").date("09 Aug 2026").eta("20 Aug 2026").terms("45 Days")
                .status("Open").received(0).raisedBy("Admin (Head Office)").notes("")
                .items(Arrays.asList(
                        POItem.builder().type("Kraft").gsm(100).width(90).bf(16).qty(3).kg(1164.0).rate(36.0).build(),
                        POItem.builder().type("Duplex Board").gsm(200).width(70).bf(0).qty(2).kg(1016.0).rate(44.0).build()
                )).build();

        PurchaseOrder po46 = PurchaseOrder.builder()
                .id("PO-2026-0046").supplier("S5").unit("U2").date("05 Aug 2026").eta("16 Aug 2026").terms("60 Days")
                .status("Partially Received").received(1).raisedBy("Admin (Head Office)").notes("High BF grade for export cartons.")
                .items(Arrays.asList(
                        POItem.builder().type("Kraft").gsm(180).width(100).bf(22).qty(2).kg(1024.0).rate(52.0).build(),
                        POItem.builder().type("Kraft").gsm(150).width(80).bf(20).qty(1).kg(452.0).rate(47.0).build()
                )).build();

        PurchaseOrder po45 = PurchaseOrder.builder()
                .id("PO-2026-0045").supplier("S1").unit("U1").date("01 Aug 2026").eta("10 Aug 2026").terms("30 Days")
                .status("Completed").received(2).raisedBy("Admin (Head Office)").notes("")
                .items(Arrays.asList(
                        POItem.builder().type("Kraft").gsm(120).width(80).bf(18).qty(2).kg(824.0).rate(38.0).build()
                )).build();

        poRepository.saveAll(Arrays.asList(po48, po47, po46, po45));

        // 10. Transfers
        transferRepository.saveAll(Arrays.asList(
                Transfer.builder().ref("TRF-2026-0091").reel("R-21068").fromUnit("U1").toUnit("U3").kg(415.0).date("10 Aug 2026").byUser("R. Karthik").notes("Balancing stock for export order").build(),
                Transfer.builder().ref("TRF-2026-0090").reel("R-21072").fromUnit("U1").toUnit("U6").kg(408.0).date("09 Aug 2026").byUser("R. Karthik").notes("").build(),
                Transfer.builder().ref("TRF-2026-0089").reel("R-21064").fromUnit("U3").toUnit("U6").kg(372.0).date("08 Aug 2026").byUser("M. Venkatesh").notes("Madurai shortfall").build()
        ));

        // 11. Activity Logs
        activityLogRepository.saveAll(Arrays.asList(
                ActivityLog.builder().icon("transfer").tone("info").title("Reel R-21068 transferred").sub("Chennai Unit → Hyderabad Unit").time("2 hours ago").build(),
                ActivityLog.builder().icon("scissors").tone("ok").title("Job completed").sub("R-21063 · 263.088 kg consumed").time("Today, 11:42 AM").build(),
                ActivityLog.builder().icon("po").tone("warn").title("PO-2026-0048 created").sub("Suvarna Durga Paper Mills · ₹57,055").time("Today, 09:30 AM").build(),
                ActivityLog.builder().icon("truck").tone("violet").title("Reel R-21078 received").sub("412 kg · PO-2026-0045").time("Yesterday").build()
        ));
    }
}
