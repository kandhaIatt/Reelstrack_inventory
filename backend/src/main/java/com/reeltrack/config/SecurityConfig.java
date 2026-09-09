package com.reeltrack.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import com.reeltrack.security.JwtAuthFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(request -> {

                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173"
                ));

                config.setAllowedMethods(List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                ));

                config.setAllowedHeaders(List.of("*"));

                config.setAllowCredentials(true);

                return config;
            }))

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

              // Public - Authentication
              .requestMatchers("/api/auth/**").permitAll()

              // Public reads for master dropdowns, units, mills, reel types, config for all authenticated users
              .requestMatchers(HttpMethod.GET, "/api/units", "/api/mills", "/api/reel-types", "/api/config", "/api/suppliers").authenticated()

              // Admin-only master writes & config updates
              .requestMatchers(HttpMethod.POST, "/api/units/**", "/api/mills/**", "/api/reel-types/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.PUT, "/api/units/**", "/api/mills/**", "/api/reel-types/**", "/api/config/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.PATCH, "/api/units/**", "/api/mills/**", "/api/reel-types/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.DELETE, "/api/units/**", "/api/mills/**", "/api/reel-types/**").hasRole("ADMIN")

              // Admin only user management and sensitive ops
              .requestMatchers(
                 "/api/users/**",
                 "/api/admin/**",
                 "/api/pos",
                 "/api/pos/*/approve",
                 "/api/pos/*/cancel",
                 "/api/pos/*/receive",
                 "/api/transfers"
              ).hasRole("ADMIN")

              // Everything else requires login
              .anyRequest().authenticated()

             )

            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}