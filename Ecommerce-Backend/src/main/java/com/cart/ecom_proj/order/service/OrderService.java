package com.cart.ecom_proj.order.service;

import com.cart.ecom_proj.audit.service.AuditLogService;
import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.service.CartService;
import com.cart.ecom_proj.config.RabbitMQConfig;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.order.dto.OrderCreatedEvent;
import com.cart.ecom_proj.order.model.Order;
import com.cart.ecom_proj.order.model.OrderItem;
import com.cart.ecom_proj.order.model.OrderStatus;
import com.cart.ecom_proj.order.repo.OrderRepo;
import com.cart.ecom_proj.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final CartService cartService;
    private final AuditLogService auditLogService;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Converts the authenticated user's current cart into a persisted order,
     * clears the cart, records a synchronous audit entry, and publishes an
     * OrderCreatedEvent so other consumers can react asynchronously.
     */
    @Transactional
    public Order checkout(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Cart cart = cartService.getOrCreateCartForUser(username);
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        BigDecimal total = cartService.calculateTotal(cart);

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        cart.getItems().forEach(cartItem -> order.getItems().add(OrderItem.builder()
                .order(order)
                .product(cartItem.getProduct())
                .quantity(cartItem.getQuantity())
                .priceAtPurchase(cartItem.getProduct().getPrice())
                .build()));

        Order savedOrder = orderRepo.save(order);

        cartService.clearCart(cart);

        auditLogService.record(username, "ORDER_CREATED",
                "Order #" + savedOrder.getId() + " created with total " + total);

        publishOrderCreatedEvent(savedOrder, user);

        return savedOrder;
    }

    private void publishOrderCreatedEvent(Order order, User user) {
        OrderCreatedEvent event = new OrderCreatedEvent(
                order.getId(),
                user.getId(),
                user.getUsername(),
                order.getTotalAmount(),
                LocalDateTime.now()
        );
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.ORDER_CREATED_ROUTING_KEY, event);
        } catch (Exception e) {
            // Do not fail order creation if the broker is unavailable.
        }
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }
}
