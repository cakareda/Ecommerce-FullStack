package com.cart.ecom_proj.order;

import com.cart.ecom_proj.audit.service.AuditLogService;
import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.model.CartItem;
import com.cart.ecom_proj.cart.service.CartService;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.order.model.Order;
import com.cart.ecom_proj.order.repo.OrderRepo;
import com.cart.ecom_proj.order.service.OrderService;
import com.cart.ecom_proj.repo.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepo orderRepo;
    @Mock
    private UserRepo userRepo;
    @Mock
    private CartService cartService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Cart cart;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("alice").password("pw").email("a@a.com").build();
        Product product = Product.builder().id(10).name("Mouse").price(new BigDecimal("19.99")).build();
        cart = Cart.builder().id(5L).user(user).build();
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).product(product).quantity(2).build());
    }

    @Test
    void checkout_throwsWhenCartIsEmpty() {
        Cart emptyCart = Cart.builder().id(6L).user(user).build();
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user));
        when(cartService.getOrCreateCartForUser("alice")).thenReturn(emptyCart);

        assertThatThrownBy(() -> orderService.checkout("alice"))
                .isInstanceOf(IllegalStateException.class);

        verifyNoInteractions(orderRepo);
    }

    @Test
    void checkout_createsOrderFromCartAndClearsIt() {
        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(user));
        when(cartService.getOrCreateCartForUser("alice")).thenReturn(cart);
        when(cartService.calculateTotal(cart)).thenReturn(new BigDecimal("39.98"));
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);
            return o;
        });

        Order order = orderService.checkout("alice");

        assertThat(order.getId()).isEqualTo(100L);
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getTotalAmount()).isEqualByComparingTo("39.98");

        verify(cartService).clearCart(cart);
        verify(auditLogService).record(eq("alice"), eq("ORDER_CREATED"), any(String.class));
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void getOrdersForUser_delegatesToRepository() {
        when(orderRepo.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(java.util.List.of());

        orderService.getOrdersForUser(1L);

        verify(orderRepo).findByUserIdOrderByCreatedAtDesc(1L);
    }
}
