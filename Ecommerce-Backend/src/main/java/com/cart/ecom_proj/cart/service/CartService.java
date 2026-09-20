package com.cart.ecom_proj.cart.service;

import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.model.CartItem;
import com.cart.ecom_proj.cart.repo.CartItemRepo;
import com.cart.ecom_proj.cart.repo.CartRepo;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;

    @Transactional
    public Cart getOrCreateCartForUser(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return cartRepo.findByUserId(user.getId())
                .orElseGet(() -> cartRepo.save(Cart.builder().user(user).build()));
    }

    @Transactional
    public Cart addItem(String username, int productId, int quantity) {
        Cart cart = getOrCreateCartForUser(username);
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        cart.getItems().stream()
                .filter(item -> item.getProduct().getId() == product.getId())
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + quantity),
                        () -> cart.getItems().add(CartItem.builder()
                                .cart(cart)
                                .product(product)
                                .quantity(quantity)
                                .build())
                );

        return cartRepo.save(cart);
    }

    @Transactional
    public Cart removeItem(String username, Long cartItemId) {
        Cart cart = getOrCreateCartForUser(username);
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        return cartRepo.save(cart);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepo.save(cart);
    }

    public BigDecimal calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
