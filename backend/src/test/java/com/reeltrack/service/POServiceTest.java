package com.reeltrack.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.reeltrack.dto.DTOs.POCreateRequest;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.BusinessConfigRepository;
import com.reeltrack.repository.PORepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.SupplierRepository;
import com.reeltrack.repository.UnitRepository;

import org.junit.jupiter.api.Test;

class POServiceTest {

    @Test
    void createRejectsEmptyItems() {
        POService service = new POService(mock(PORepository.class), mock(ReelRepository.class),
                mock(SupplierRepository.class), mock(UnitRepository.class), mock(ActivityLogRepository.class), mock(BusinessConfigRepository.class), mock(EmailService.class), mock(NotificationService.class));

        POCreateRequest request = new POCreateRequest("S1", "U1", "20 Aug 2026", "30 Days", null);

        assertThrows(IllegalArgumentException.class, () -> service.createPO(request, "admin"));
    }
}
