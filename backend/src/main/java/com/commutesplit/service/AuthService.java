package com.commutesplit.service;

import com.commutesplit.dto.*;
import com.commutesplit.entity.User;
import com.commutesplit.repository.UserRepository;
import com.commutesplit.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
            .name(req.name())
            .email(req.email())
            .passwordHash(passwordEncoder.encode(req.password()))
            .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail()));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail()));
    }
}
