package com.cart.ecom_proj.cart.controller;

import com.cart.ecom_proj.cart.dto.CartItemRequest;
import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart operations for the authenticated user")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getOrCreateCartForUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Cart> addItem(Authentication authentication, @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(authentication.getName(), request.getProductId(), request.getQuantity()));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Cart> removeItem(Authentication authentication, @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(authentication.getName(), cartItemId));
    }
}
