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

                config.setAllowedOriginPatterns(List.of("*","http://localhost:5174"));

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

    // Public - Swagger / OpenAPI
             .requestMatchers(
             "/swagger-ui/**",
             "/swagger-ui.html",
             "/v3/api-docs/**"
             ).permitAll()

    // Public - Authentication
            .requestMatchers("/api/auth/**").permitAll()

              // Reads for all authenticated users (User read-all)
              .requestMatchers(HttpMethod.GET, "/api/**").authenticated()

              // Users can only create cutting jobs and weight adjustments
              .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyRole("ADMIN", "USER")
              .requestMatchers(HttpMethod.POST, "/api/reels/*/adjust-weight").hasAnyRole("ADMIN", "USER")

              // All other modifications (POST, PUT, PATCH, DELETE) require ADMIN
              .requestMatchers(HttpMethod.POST, "/api/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.PATCH, "/api/**").hasRole("ADMIN")
              .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

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