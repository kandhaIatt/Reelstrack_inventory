package com.reeltrack.service;

import com.reeltrack.model.LedgerEntry;
import com.reeltrack.model.Reel;
import com.reeltrack.repository.LedgerEntryRepository;
import com.reeltrack.repository.ReelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReelServiceTest {

    private ReelRepository reelRepository;
    private LedgerEntryRepository ledgerEntryRepository;
    private ReelService reelService;

    @BeforeEach
    void setUp() {
        reelRepository = mock(ReelRepository.class);
        ledgerEntryRepository = mock(LedgerEntryRepository.class);
        reelService = new ReelService(reelRepository, ledgerEntryRepository);
    }

    @Test
    void testUpdateStatus() {
        Reel r = new Reel();
        r.setId("R1");
        r.setWeight(new BigDecimal("100.0"));
        r.setStatus("AVAILABLE");

        when(reelRepository.findById("R1")).thenReturn(Optional.of(r));
        when(reelRepository.save(any(Reel.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Reel> updated = reelService.updateStatus("R1", "ON_HOLD", "Quality issue");

        assertTrue(updated.isPresent());
        assertEquals("ON_HOLD", updated.get().getStatus());

        verify(reelRepository).save(r);
        
        ArgumentCaptor<LedgerEntry> captor = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        
        LedgerEntry entry = captor.getValue();
        assertEquals("R1", entry.getReelId());
        assertTrue(entry.getDescription().contains("ON_HOLD"));
        assertTrue(entry.getDescription().contains("Quality issue"));
        assertEquals(BigDecimal.ZERO, entry.getAmount());
    }

    @Test
    void testApplyCorrection() {
        Reel r = new Reel();
        r.setId("R1");
        r.setWeight(new BigDecimal("100.0"));
        r.setOrig(100.0);
        r.setRemaining(100.0);

        when(reelRepository.findById("R1")).thenReturn(Optional.of(r));
        when(reelRepository.save(any(Reel.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Reel> updated = reelService.applyCorrection("R1", new BigDecimal("-5.0"), "Moisture loss", false);

        assertTrue(updated.isPresent());
        assertEquals(new BigDecimal("95.0"), updated.get().getWeight());

        verify(reelRepository).save(r);

        ArgumentCaptor<LedgerEntry> captor = ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        
        LedgerEntry entry = captor.getValue();
        assertEquals(new BigDecimal("-5.0"), entry.getAmount());
        assertEquals(new BigDecimal("95.0"), entry.getBalanceAfter());
        assertTrue(entry.getDescription().contains("Moisture loss"));
    }
}
