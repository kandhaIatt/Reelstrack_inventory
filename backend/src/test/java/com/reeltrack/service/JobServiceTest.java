package com.reeltrack.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.reeltrack.dto.DTOs.JobCalcRequest;
import com.reeltrack.dto.DTOs.RecommendationCandidate;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.CuttingJobRepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock ReelRepository reelRepository;
    @Mock CuttingJobRepository jobRepository;
    @Mock ActivityLogRepository activityLogRepository;
    @Mock UserRepository userRepository;

    private JobService service;

    @BeforeEach
    void setUp() {
        service = new JobService(reelRepository, jobRepository, activityLogRepository, userRepository);
    }

    @Test
    void calculateAppliesCorrugationFormula() {
        JobCalcRequest request = JobCalcRequest.builder()
                .w(80).l(63).gsm(120).sheets(3000).corr(true).f(0.45).build();

        var result = service.calculate(request);

        assertEquals(174.0, result.getEffGsm(), 0.001);
        assertEquals(263.088, result.getKg(), 0.001);
        assertTrue(result.getIsOk() == false);
    }

    @Test
    void calculateRejectsNonPositiveInputs() {
        JobCalcRequest request = JobCalcRequest.builder()
                .w(0).l(63).gsm(120).sheets(3000).corr(false).build();

        assertThrows(IllegalArgumentException.class, () -> service.calculate(request));
    }

    @Test
    void recommendationsPreferFinishingPartialMatchingReel() {
        Reel partial = Reel.builder().id("R-1").type("Kraft").gsm(120).width(80)
                .orig(400.0).remaining(100.0).unit("U1").build();
        Reel full = Reel.builder().id("R-2").type("Kraft").gsm(120).width(80)
                .orig(400.0).remaining(300.0).unit("U1").build();
        when(reelRepository.findAll()).thenReturn(List.of(full, partial));

        JobCalcRequest request = JobCalcRequest.builder()
                .w(80).l(63).gsm(120).sheets(1000).corr(false).build();

        List<RecommendationCandidate> result = service.getRecommendations(request, "U1");

        assertEquals("R-1", result.get(0).getReel().getId());
    }

    @Test
    void executeRejectsReelOutsideOperatorUnit() {
        Reel reel = Reel.builder().id("R-1").width(80).gsm(120).remaining(400.0)
                .orig(400.0).unit("U2").build();
        when(reelRepository.findById("R-1")).thenReturn(Optional.of(reel));
        when(userRepository.findByUsernameIgnoreCase("operator"))
                .thenReturn(Optional.of(com.reeltrack.model.User.builder().username("operator")
                        .role(com.reeltrack.model.Role.OPERATOR).unitId("U1").build()));

        JobCalcRequest request = JobCalcRequest.builder().reelId("R-1")
                .w(80).l(63).gsm(120).sheets(1000).corr(false).build();

        assertThrows(IllegalArgumentException.class, () -> service.executeJob(request, "operator"));
    }
}
