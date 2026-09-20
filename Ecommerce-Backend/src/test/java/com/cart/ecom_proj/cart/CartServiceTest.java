package com.cart.ecom_proj.cart;

import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.repo.CartItemRepo;
import com.cart.ecom_proj.cart.repo.CartRepo;
import com.cart.ecom_proj.cart.service.CartService;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepo cartRepo;
    @Mock
    private CartItemRepo cartItemRepo;
    @Mock
    private ProductRepo productRepo;
    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private CartService cartService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("alice").password("pw").email("a@a.com").build();
        product = Product.builder().id(10).name("Mouse").price(new BigDecimal("19.99")).build();
    }

    @Test
    void getOrCreateCartForUser_createsNewCartWhenNoneExists() {
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user));
        when(cartRepo.findByUserId(1L)).thenReturn(Optional.empty());
        when(cartRepo.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        Cart cart = cartService.getOrCreateCartForUser("alice");

        assertThat(cart.getUser()).isEqualTo(user);
        verify(cartRepo).save(any(Cart.class));
    }

    @Test
    void addItem_addsNewLineItemWhenProductNotAlreadyInCart() {
        Cart existingCart = Cart.builder().id(5L).user(user).build();
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user));
        when(cartRepo.findByUserId(1L)).thenReturn(Optional.of(existingCart));
        when(productRepo.findById(10)).thenReturn(Optional.of(product));
        when(cartRepo.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        Cart updated = cartService.addItem("alice", 10, 2);

        assertThat(updated.getItems()).hasSize(1);
        assertThat(updated.getItems().get(0).getQuantity()).isEqualTo(2);
    }

    @Test
    void addItem_incrementsQuantityWhenProductAlreadyInCart() {
        Cart existingCart = Cart.builder().id(5L).user(user).build();
        existingCart.getItems().add(com.cart.ecom_proj.cart.model.CartItem.builder()
                .id(1L).cart(existingCart).product(product).quantity(1).build());

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user));
        when(cartRepo.findByUserId(1L)).thenReturn(Optional.of(existingCart));
        when(productRepo.findById(10)).thenReturn(Optional.of(product));
        when(cartRepo.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));

        Cart updated = cartService.addItem("alice", 10, 3);

        assertThat(updated.getItems()).hasSize(1);
        assertThat(updated.getItems().get(0).getQuantity()).isEqualTo(4);
    }

    @Test
    void calculateTotal_sumsLineItemPrices() {
        Cart cart = Cart.builder().id(5L).user(user).build();
        cart.getItems().add(com.cart.ecom_proj.cart.model.CartItem.builder()
                .id(1L).cart(cart).product(product).quantity(3).build());

        BigDecimal total = cartService.calculateTotal(cart);

        assertThat(total).isEqualByComparingTo(new BigDecimal("59.97"));
    }
}
