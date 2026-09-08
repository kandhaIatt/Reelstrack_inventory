package com.reeltrack.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.reeltrack.dto.DTOs.TransferRequest;
import com.reeltrack.repository.ActivityLogRepository;
import com.reeltrack.repository.ReelRepository;
import com.reeltrack.repository.TransferRepository;

import org.junit.jupiter.api.Test;

class TransferServiceTest {

    @Test
    void transferRequiresDestinationUnit() {
        TransferService service = new TransferService(mock(ReelRepository.class),
                mock(TransferRepository.class), mock(ActivityLogRepository.class));

        TransferRequest request = new TransferRequest("R-1", "", null, null);

        assertThrows(IllegalArgumentException.class, () -> service.executeTransfer(request, "admin"));
    }
}
