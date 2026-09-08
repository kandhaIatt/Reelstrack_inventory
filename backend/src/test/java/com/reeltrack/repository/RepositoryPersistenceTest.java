package com.reeltrack.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.reeltrack.model.Reel;
import com.reeltrack.model.Role;
import com.reeltrack.model.User;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryPersistenceTest {

    @Autowired ReelRepository reelRepository;
    @Autowired UserRepository userRepository;

    @Test
    void persistsReelAndQueriesByUnit() {
        reelRepository.save(Reel.builder().id("R-TEST").type("Kraft").gsm(120).width(80)
                .orig(400.0).remaining(250.0).mill("Test Mill").unit("U1").build());

        assertEquals(1, reelRepository.findByUnit("U1").size());
        assertTrue(reelRepository.findById("R-TEST").isPresent());
    }

    @Test
    void persistsUserWithRoleAndUniqueUsername() {
        userRepository.save(User.builder().username("test-user").password("hash")
                .name("Test User").role(Role.OPERATOR).unitId("U1").build());

        User saved = userRepository.findByUsernameIgnoreCase("TEST-USER").orElseThrow();
        assertEquals(Role.OPERATOR, saved.getRole());
        assertEquals("U1", saved.getUnitId());
    }
}