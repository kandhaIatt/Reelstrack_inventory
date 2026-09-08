package com.reeltrack.security;

import com.reeltrack.model.User;
import com.reeltrack.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl
        implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(
            UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException(
                        "Invalid credentials"
                    )
                );

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isActive(),
                true,
                true,
                true,
                List.of(
                    new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()
                    )
                )
        );
    }
}