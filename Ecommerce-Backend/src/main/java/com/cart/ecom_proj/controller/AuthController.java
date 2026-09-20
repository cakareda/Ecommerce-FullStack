package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.JwtResponse;
import com.cart.ecom_proj.dto.LoginRequest;
import com.cart.ecom_proj.dto.RegisterRequest;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepo;
import com.cart.ecom_proj.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        org.springframework.security.core.userdetails.User userDetails = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), userDetails.getUsername(), role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepo.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepo.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role userRole = Role.ROLE_USER;
        if ("ADMIN".equalsIgnoreCase(registerRequest.getRole())) {
            userRole = Role.ROLE_ADMIN;
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .build();

        userRepo.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}