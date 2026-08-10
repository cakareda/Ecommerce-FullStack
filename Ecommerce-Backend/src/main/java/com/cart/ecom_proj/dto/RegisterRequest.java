package com.cart.ecom_proj.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // "USER" veya "ADMIN"
}